// app/api/data/route.js

let latestData = { fillLevel: 0, distance: 0, timestamp: null };

export async function GET() {
  return Response.json(latestData);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { fillLevel, distance } = body;

    // Validate
    if (typeof fillLevel !== 'number' || typeof distance !== 'number') {
      return Response.json({ error: 'Invalid data' }, { status: 400 });
    }

    latestData = {
      fillLevel,
      distance,
      timestamp: new Date().toISOString(),
    };

    console.log('📥 Received from ESP32:', latestData);
    return Response.json({ success: true, data: latestData });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}