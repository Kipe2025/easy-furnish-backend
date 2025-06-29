import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '€9.90',
    period: '/month',
    description: 'Billed monthly, cancel anytime.'
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '€89.90',
    period: '/year',
    description: 'Billed yearly, save 25%.'
  }
];

function getToken() {
  return localStorage.getItem('token');
}

const PricingPage: React.FC = () => {
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStatus() {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubStatus(data.subscriptionStatus || 'none');
      }
    }
    fetchStatus();
  }, []);

  const handleSubscribe = async (plan: string) => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        navigate('/auth');
        return;
      }
      const res = await fetch(`${API_URL}/billing/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout session');
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleManage = async () => {
    setPortalLoading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        navigate('/auth');
        return;
      }
      const res = await fetch(`${API_URL}/billing/create-portal-session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open billing portal');
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message);
    }
    setPortalLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded shadow p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Easy Furnish Subscription</h2>
        {subStatus && (
          <div className="mb-4 text-center">
            <span className="font-semibold">Current status:</span>{' '}
            <span className={subStatus === 'active' ? 'text-green-600' : 'text-red-600'}>
              {subStatus === 'active' ? 'Active Subscription' : 'No Active Subscription'}
            </span>
          </div>
        )}
        <div className="flex gap-6 justify-center mb-6">
          {plans.map(plan => (
            <div key={plan.id} className="border rounded p-6 w-56 flex flex-col items-center">
              <div className="text-xl font-bold mb-2">{plan.name}</div>
              <div className="text-3xl font-extrabold mb-1">{plan.price}<span className="text-base font-normal">{plan.period}</span></div>
              <div className="mb-4 text-gray-500 text-sm">{plan.description}</div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading || subStatus === 'active'}
              >
                {subStatus === 'active' ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
        {subStatus === 'active' && (
          <div className="text-center mb-4">
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              onClick={handleManage}
              disabled={portalLoading}
            >
              {portalLoading ? 'Loading...' : 'Manage Subscription'}
            </button>
          </div>
        )}
        {error && <div className="text-red-600 text-center mb-2">{error}</div>}
        <div className="text-center mt-4">
          <button className="text-blue-600 underline" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 