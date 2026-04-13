
async function testApi() {
    try {
        console.log('Calling API /api/user...');
        const res = await fetch('http://localhost:8081/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: '0x1234567890123456789012345678901234567890' })
        });
        
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testApi();
