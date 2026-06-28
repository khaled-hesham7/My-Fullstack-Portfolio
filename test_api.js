async function main() {
  const start = Date.now();
  try {
    const res = await fetch('http://127.0.0.1:8000/api/Home');
    console.log('Backend response status:', res.status);
    const data = await res.json();
    console.log('Backend response time:', Date.now() - start, 'ms');
    console.log('Is success:', data.success);
  } catch (err) {
    console.error('Error fetching backend:', err.message);
  }
}
main();
