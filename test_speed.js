async function main() {
  const start = Date.now();
  try {
    const res = await fetch('http://localhost:3000/');
    const text = await res.text();
    console.log('Frontend response time:', Date.now() - start, 'ms');
  } catch (err) {
    console.error('Error fetching frontend:', err.message);
  }
}
main();
