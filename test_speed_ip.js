async function main() {
  const start = Date.now();
  try {
    const res = await fetch('http://127.0.0.1:3000/');
    console.log('Frontend status:', res.status);
    const text = await res.text();
    console.log('Frontend IP response time:', Date.now() - start, 'ms');
  } catch (err) {
    console.error('Error fetching frontend:', err.message);
  }
}
main();
