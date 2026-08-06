import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Plus,
  Trash2,
  RefreshCw,
  Check,
  X,
  Users,
  FileText,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  AlertCircle,
} from 'lucide-react';

import {
  Card,
  Badge,
  Modal,
  Button,
  EmptyState,
} from '../components/ui';

import { accountService } from '../services/api';
import { formatNumber, cn } from '../utils/helpers';


type SocialAccount = {
  id: number | string;
  platform: string;
  handle?: string;
  username?: string;
  account_name?: string;
  name?: string;
  followers?: number;
  posts?: number;
  status?: string;
};



const availablePlatforms = [

  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    desc: 'Connect your Facebook Pages',
  },

  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#E1306C',
    desc: 'Connect your Instagram Business',
  },

  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: '#1DA1F2',
    desc: 'Connect your Twitter account',
  },

  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
    desc: 'Connect your LinkedIn Pages',
  },

  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
    desc: 'Connect your YouTube channel',
  },

  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: Globe,
    color: '#E60023',
    desc: 'Connect your Pinterest account',
  },

];



export function SocialAccountsPage() {


const [accounts,setAccounts] =
useState<SocialAccount[]>([]);


const [loading,setLoading] =
useState(true);


const [refreshing,setRefreshing] =
useState(false);


const [showConnect,setShowConnect] =
useState(false);


const [connecting,setConnecting] =
useState<string|null>(null);


const [disconnectTarget,setDisconnectTarget] =
useState<string|number|null>(null);


const [error,setError] =
useState<string|null>(null);



const loadAccounts = async()=>{

try{

setError(null);

const response =
await accountService.getAll();


const data =
Array.isArray(response.data)
?
response.data
:
response.data?.items ||
response.data?.accounts ||
[];


setAccounts(data);


}catch(err:any){

console.error(
"Failed loading accounts",
err
);


setError(
err.response?.data?.detail ||
"Failed to load accounts"
);


}
finally{

setLoading(false);
setRefreshing(false);

}

};



useEffect(()=>{

loadAccounts();

},[]);



const handleRefresh = async()=>{

setRefreshing(true);

await loadAccounts();

};



const handleConnect = async(platformId:string)=>{


try{


setConnecting(platformId);

setError(null);


let response;



if(platformId==="facebook"){

response =
await accountService.facebookLogin();

}


else if(platformId==="instagram"){

response =
await accountService.instagramLogin();

}


else if(platformId==="twitter"){

response =
await accountService.twitterLogin();

}


else if(platformId==="pinterest"){

response =
await accountService.pinterestLogin();

}


else{


setError(
`${platformId} integration is not connected to backend yet.`
);

return;


}



const authUrl =
response.data?.url ||
response.data?.auth_url ||
response.data?.redirect_url;



if(authUrl){

window.location.assign(authUrl);

return;

}



if(typeof response.data==="string"){

window.location.assign(response.data);

return;

}



throw new Error(
`${platformId} login URL was not returned by backend`
);



}
catch(err:any){

console.error(
`Failed to connect ${platformId}`,
err
);


setError(
err.response?.data?.detail ||
err.message ||
`Failed to connect ${platformId}`
);


}
finally{

setConnecting(null);

}


};
const handleDisconnect = async () => {

  if (!disconnectTarget) return;


  try {

    setError(null);


    await accountService.delete(
      disconnectTarget
    );


    setAccounts((prev) =>
      prev.filter(
        (account) =>
          account.id !== disconnectTarget
      )
    );


    setDisconnectTarget(null);


  } catch (err:any) {


    console.error(
      "Failed to disconnect account:",
      err
    );


    setError(
      err.response?.data?.detail ||
      "Failed to disconnect social account."
    );


  }

};



const connectedAccounts =
accounts.filter(
  (account) =>
    account.status === "connected" ||
    account.status === undefined
);



const connectedPlatformIds =
new Set(
  connectedAccounts.map(
    (account)=>
      account.platform?.toLowerCase()
  )
);



const disconnectedPlatforms =
availablePlatforms.filter(
  (platform)=>
    !connectedPlatformIds.has(
      platform.id
    )
);



const totalFollowers =
connectedAccounts.reduce(
  (sum,account)=>
    sum + Number(account.followers || 0),
  0
);



const totalPosts =
connectedAccounts.reduce(
  (sum,account)=>
    sum + Number(account.posts || 0),
  0
);



const getAccountDisplayName =
(account:SocialAccount)=>{


return (

account.handle ||
account.username ||
account.account_name ||
account.name ||
"Connected account"

);


};



const getPlatformDetails =
(platformId:string)=>{


return (

availablePlatforms.find(
(platform)=>
platform.id ===
platformId?.toLowerCase()
)

||

{

id:platformId,

name:platformId,

icon:Globe,

color:"#6366F1",

desc:"Connected social account"

}

);


};




return (

<div className="space-y-6">


<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">


<div>


<h1 className="text-2xl font-bold text-gray-900">
Social Accounts
</h1>


<p className="text-sm text-gray-500 mt-1">
Manage your connected social media platforms
</p>


</div>



<Button

icon={
<Plus className="w-4 h-4"/>
}

onClick={()=>
setShowConnect(true)
}

>

Connect Account

</Button>


</div>




{
error && (

<div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">


<div className="flex gap-2">


<AlertCircle className="w-5 h-5 text-red-500"/>


<p className="text-sm text-red-600">

{error}

</p>


</div>


</div>

)

}




<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">


{

[

{

label:"Connected Accounts",

value:connectedAccounts.length,

icon:Check

},

{

label:"Total Followers",

value:formatNumber(totalFollowers),

icon:Users

},

{

label:"Total Posts",

value:totalPosts,

icon:FileText

}


].map((stat)=>(


<Card
key={stat.label}
className="p-5 flex items-center gap-4"
>


<div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">

<stat.icon className="w-6 h-6 text-white"/>

</div>



<div>

<p className="text-2xl font-bold text-gray-900">

{
loading
?
"..."
:
stat.value
}

</p>


<p className="text-sm text-gray-500">

{stat.label}

</p>


</div>


</Card>


))

}


</div>




<div>


<div className="flex items-center justify-between mb-4">


<h2 className="text-lg font-semibold text-gray-900">

Connected Accounts

</h2>



<Button

variant="secondary"

size="sm"

icon={
<RefreshCw
className={cn(
"w-3.5 h-3.5",
refreshing &&
"animate-spin"
)}
/>
}

onClick={handleRefresh}

loading={refreshing}

>

Refresh

</Button>


</div>
{
loading ? (

<Card className="p-8">

<div className="flex justify-center items-center">

<RefreshCw className="w-6 h-6 animate-spin text-indigo-600"/>

<span className="ml-3 text-sm text-gray-500">
Loading connected accounts...
</span>

</div>

</Card>


) : connectedAccounts.length === 0 ? (


<Card className="p-0">

<EmptyState

icon={
<AlertCircle className="w-8 h-8"/>
}

title="No accounts connected"

description="Connect your social media accounts to start scheduling posts."

action={

<Button

icon={
<Plus className="w-4 h-4"/>
}

onClick={()=>
setShowConnect(true)
}

>

Connect Account

</Button>

}

/>

</Card>



) : (



<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">


<AnimatePresence>


{

connectedAccounts.map((account)=>{


const config =
getPlatformDetails(
account.platform
);


const Icon =
config.icon;



return (


<motion.div

key={account.id}

initial={{
opacity:0,
scale:0.9
}}

animate={{
opacity:1,
scale:1
}}

>


<Card

hover

className="p-5"

>



<div className="flex items-start justify-between mb-4">


<div className="flex items-center gap-3">



<div

className="w-11 h-11 rounded-xl flex items-center justify-center text-white"

style={{
backgroundColor:
config.color
}}

>


<Icon className="w-5 h-5"/>


</div>




<div>


<p className="text-sm font-semibold text-gray-900">

{config.name}

</p>


<p className="text-xs text-gray-500">

{
getAccountDisplayName(
account
)
}

</p>


</div>



</div>




<Badge

variant="success"

dot

>

Connected

</Badge>



</div>





<div className="grid grid-cols-2 gap-3 mb-4">


<div className="p-3 bg-gray-50 rounded-xl">


<p className="text-xs text-gray-500">

Followers

</p>


<p className="text-lg font-bold">

{

formatNumber(
Number(
account.followers || 0
)
)

}

</p>


</div>





<div className="p-3 bg-gray-50 rounded-xl">


<p className="text-xs text-gray-500">

Posts

</p>


<p className="text-lg font-bold">

{

Number(
account.posts || 0
)

}

</p>


</div>



</div>




<Button

variant="danger"

size="sm"

onClick={()=>
setDisconnectTarget(
account.id
)
}

icon={
<Trash2 className="w-3.5 h-3.5"/>
}

>

Disconnect

</Button>



</Card>



</motion.div>



);


})


}



</AnimatePresence>


</div>



)

}



</div>





{
disconnectedPlatforms.length > 0 && (


<div>


<h2 className="text-lg font-semibold text-gray-900 mb-4">

Available Platforms

</h2>




<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">


{

disconnectedPlatforms.map((platform)=>{


return (


<Card

key={platform.id}

hover

className="p-5 flex items-center gap-4"

>



<div

className="w-11 h-11 rounded-xl flex items-center justify-center text-white"

style={{
backgroundColor:
platform.color
}}

>


<platform.icon className="w-5 h-5"/>


</div>




<div className="flex-1">


<p className="text-sm font-semibold">

{platform.name}

</p>


<p className="text-xs text-gray-500">

{platform.desc}

</p>


</div>





<Button

size="sm"

variant="outline"

onClick={()=>
handleConnect(
platform.id
)
}

loading={
connecting === platform.id
}

>

{

connecting === platform.id

?

"Connecting..."

:

"Connect"

}


</Button>




</Card>


);


})


}



</div>


</div>


)

}
<Modal

isOpen={showConnect}

onClose={()=>
setShowConnect(false)
}

title="Connect a Social Account"

size="md"

>


<div className="space-y-3">


{

availablePlatforms.map((platform)=>{


const isConnected =
connectedPlatformIds.has(
platform.id
);



return (


<div

key={platform.id}

className="flex items-center gap-3 p-3 border rounded-xl"

>



<div

className="w-10 h-10 rounded-xl flex items-center justify-center text-white"

style={{
backgroundColor:
platform.color
}}

>


<platform.icon className="w-5 h-5"/>


</div>




<div className="flex-1">


<p className="font-medium">

{platform.name}

</p>


<p className="text-xs text-gray-500">

{platform.desc}

</p>


</div>





{

isConnected ? (


<Badge

variant="success"

dot

>

Connected

</Badge>



) : (



<Button

size="sm"

onClick={()=>
handleConnect(
platform.id
)
}

loading={
connecting === platform.id
}

>


{

connecting === platform.id

?

"Connecting..."

:

"Connect"

}



</Button>



)


}



</div>


);


})


}



</div>


</Modal>





<Modal

isOpen={!!disconnectTarget}

onClose={()=>
setDisconnectTarget(null)
}

title="Disconnect Account?"

size="sm"

>


<p className="text-sm text-gray-600 mb-6">

This will remove the account from your workspace.

</p>




<div className="flex gap-3">


<Button

variant="secondary"

fullWidth

onClick={()=>
setDisconnectTarget(null)
}

>

Cancel

</Button>





<Button

variant="danger"

fullWidth

onClick={handleDisconnect}

icon={
<X className="w-4 h-4"/>
}

>

Disconnect

</Button>



</div>


</Modal>



</div>

);

}