import { useState } from 'react';

type EmailFrequency = 'immediate' | 'daily' | 'weekly';

export function EmailPreferencesPage() {
  const [frequency, setFrequency] =
    useState<EmailFrequency>('immediate');

  const [promotional, setPromotional] = useState(false);

  const handleSave = () => {
    alert('Email preferences saved successfully!');
  };

  const optionStyle = (selected: boolean) => ({
    width: '100%',
    boxSizing: 'border-box' as const,
    textAlign: 'left' as const,
    padding: '18px',
    marginBottom: '12px',
    borderRadius: '10px',
    border: selected
      ? '2px solid #4f46e5'
      : '1px solid #d1d5db',
    backgroundColor: selected ? '#eef2ff' : '#ffffff',
    cursor: 'pointer',
  });

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '24px',
        color: '#111827',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: 0,
          }}
        >
          Email Preferences
        </h1>

        <p
          style={{
            color: '#6b7280',
            fontSize: '14px',
            marginTop: '6px',
          }}
        >
          Choose how frequently you want to receive email notifications.
        </p>
      </div>

      {/* Frequency Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '6px',
          }}
        >
          Email Notification Frequency
        </h2>

        <p
          style={{
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '20px',
          }}
        >
          Select when you want to receive notification emails.
        </p>

        {/* Immediately */}
        <button
          type="button"
          onClick={() => setFrequency('immediate')}
          style={optionStyle(frequency === 'immediate')}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                minWidth: '18px',
                borderRadius: '50%',
                border: '2px solid #4f46e5',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {frequency === 'immediate' && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                  }}
                />
              )}
            </span>

            <div>
              <div style={{ fontWeight: '600' }}>
                Immediately
              </div>

              <div
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  marginTop: '5px',
                }}
              >
                Receive email notifications as soon as an important event occurs.
              </div>
            </div>
          </div>
        </button>

        {/* Daily Summary */}
        <button
          type="button"
          onClick={() => setFrequency('daily')}
          style={optionStyle(frequency === 'daily')}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                minWidth: '18px',
                borderRadius: '50%',
                border: '2px solid #4f46e5',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {frequency === 'daily' && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                  }}
                />
              )}
            </span>

            <div>
              <div style={{ fontWeight: '600' }}>
                Daily Summary
              </div>

              <div
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  marginTop: '5px',
                }}
              >
                Receive one email containing a summary of your daily notifications.
              </div>
            </div>
          </div>
        </button>

        {/* Weekly Summary */}
        <button
          type="button"
          onClick={() => setFrequency('weekly')}
          style={optionStyle(frequency === 'weekly')}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                minWidth: '18px',
                borderRadius: '50%',
                border: '2px solid #4f46e5',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {frequency === 'weekly' && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                  }}
                />
              )}
            </span>

            <div>
              <div style={{ fontWeight: '600' }}>
                Weekly Summary
              </div>

              <div
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  marginTop: '5px',
                }}
              >
                Receive one email containing a summary of your weekly notifications.
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Promotional Emails */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: 0,
            }}
          >
            Promotional Emails
          </h2>

          <p
            style={{
              color: '#6b7280',
              fontSize: '14px',
              marginTop: '6px',
            }}
          >
            Receive product updates, tips, offers, and promotional information.
          </p>
        </div>

        {/* Toggle */}
        <button
          type="button"
          onClick={() => setPromotional(!promotional)}
          style={{
            width: '52px',
            height: '28px',
            minWidth: '52px',
            borderRadius: '20px',
            border: 'none',
            padding: '3px',
            backgroundColor: promotional
              ? '#4f46e5'
              : '#d1d5db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: promotional
              ? 'flex-end'
              : 'flex-start',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            }}
          />
        </button>
      </div>

      {/* Save */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={handleSave}
          style={{
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '11px 20px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}