import os
from typing import Dict, Optional
import httpx
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

router = APIRouter(prefix="/linkedin", tags=["LinkedIn Integration"])

LINKEDIN_API_VERSION = "202607"  # Use latest version format YYYYMM
LINKEDIN_BASE_URL = "https://api.linkedin.com/rest"


def _get_headers(access_token: str) -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {access_token}",
        "LinkedIn-Version": LINKEDIN_API_VERSION,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
    }


# 1. CAROUSEL / DOCUMENT PUBLISHING
@router.post("/publish/carousel")
async def publish_carousel(
    access_token: str,
    author_urn: str,  # e.g., "urn:li:person:123" or "urn:li:organization:12345"
    commentary: str,
    title: str,
    file: UploadFile = File(...),
):
    """
    Publishes an organic document (PDF carousel) to LinkedIn.
    LinkedIn renders multi-page PDFs as swipeable slide carousels.
    """
    headers = _get_headers(access_token)
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Step 1: Initialize Document Upload
        init_resp = await client.post(
            f"{LINKEDIN_BASE_URL}/documents?action=initializeUpload",
            headers=headers,
            json={"initializeUploadRequest": {"owner": author_urn}}
        )
        if init_resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Doc init failed: {init_resp.text}")
        
        init_data = init_resp.json().get("value", {})
        upload_url = init_data.get("uploadUrl")
        document_urn = init_data.get("document")

        # Step 2: Upload Binary PDF Content
        file_bytes = await file.read()
        upload_headers = {"Authorization": f"Bearer {access_token}"}
        upload_resp = await client.put(upload_url, headers=upload_headers, content=file_bytes)
        
        if upload_resp.status_code not in (200, 201):
            raise HTTPException(status_code=400, detail="Binary document upload failed.")

        # Step 3: Create the Post referencing the Document URN
        post_payload = {
            "author": author_urn,
            "commentary": commentary,
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": []
            },
            "lifecycleState": "PUBLISHED",
            "content": {
                "media": {
                    "id": document_urn,
                    "title": title
                }
            }
        }
        
        post_resp = await client.post(
            f"{LINKEDIN_BASE_URL}/posts",
            headers=headers,
            json=post_payload
        )
        
        if post_resp.status_code not in (200, 201):
            raise HTTPException(status_code=400, detail=f"Post creation failed: {post_resp.text}")
            
        return {"status": "success", "document_urn": document_urn, "response": post_resp.json()}


# 2. VIDEO PUBLISHING
@router.post("/publish/video")
async def publish_video(
    access_token: str,
    author_urn: str,
    commentary: str,
    file: UploadFile = File(...),
):
    """
    Publishes a video to LinkedIn using the required chunked/asynchronous flow.
    """
    headers = _get_headers(access_token)
    file_bytes = await file.read()
    file_size = len(file_bytes)

    async with httpx.AsyncClient(timeout=120.0) as client:
        # Step 1: Initialize Video Upload
        init_resp = await client.post(
            f"{LINKEDIN_BASE_URL}/videos?action=initializeUpload",
            headers=headers,
            json={
                "initializeUploadRequest": {
                    "owner": author_urn,
                    "fileSizeBytes": file_size,
                    "uploadThumbnail": False
                }
            }
        )
        if init_resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Video init failed: {init_resp.text}")

        init_val = init_resp.json().get("value", {})
        video_urn = init_val.get("video")
        upload_instructions = init_val.get("uploadInstructions", [])
        
        uploaded_part_ids = []

        # Step 2: Upload Video Chunks
        for instruction in upload_instructions:
            upload_url = instruction.get("uploadUrl")
            first_byte = instruction.get("firstByte")
            last_byte = instruction.get("lastByte")
            
            chunk_data = file_bytes[first_byte : last_byte + 1]
            
            chunk_resp = await client.put(
                upload_url,
                headers={"Authorization": f"Bearer {access_token}"},
                content=chunk_data
            )
            
            if chunk_resp.status_code not in (200, 201):
                raise HTTPException(status_code=400, detail="Failed to upload video chunk segment.")
            
            etag = chunk_resp.headers.get("ETag")
            if etag:
                uploaded_part_ids.append(etag)

        # Step 3: Finalize Video Upload
        finalize_resp = await client.post(
            f"{LINKEDIN_BASE_URL}/videos?action=finalizeUpload",
            headers=headers,
            json={
                "finalizeUploadRequest": {
                    "video": video_urn,
                    "uploadedPartIds": uploaded_part_ids
                }
            }
        )
        
        if finalize_resp.status_code not in (200, 201):
            raise HTTPException(status_code=400, detail=f"Video finalization failed: {finalize_resp.text}")

        # Step 4: Create Post Referencing Video URN
        post_payload = {
            "author": author_urn,
            "commentary": commentary,
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": []
            },
            "lifecycleState": "PUBLISHED",
            "content": {
                "media": {
                    "id": video_urn
                }
            }
        }
        
        post_resp = await client.post(
            f"{LINKEDIN_BASE_URL}/posts",
            headers=headers,
            json=post_payload
        )
        
        if post_resp.status_code not in (200, 201):
            raise HTTPException(status_code=400, detail=f"Video post creation failed: {post_resp.text}")

        return {"status": "success", "video_urn": video_urn, "response": post_resp.json()}