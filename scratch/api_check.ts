async function main() {
  const url = "http://localhost:3000/api/subject-filtered?subject=Computer%20Organization&prefix=1602-24-737-&start=001&end=152";
  console.log("Fetching from:", url);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    const data = await res.json();
    if (Array.isArray(data)) {
      console.log("Length:", data.length);
      console.log("First hall ticket:", data[0]?.hall_ticket);
      console.log("Last hall ticket:", data[data.length - 1]?.hall_ticket);
    } else {
      console.log("Response:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
