interface LogActionParams {
  action: string;
  description: string;
  user_id?: number;
  user_email?: string;
  product_code?: string;
  product_name?: string;
  ip_address?: string;
}

export async function logAction(params: LogActionParams) {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}