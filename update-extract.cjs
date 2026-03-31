const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add contract extraction function after the doScan function
c = c.replace(
  `const doFile = (e) =>`,
  `// Extract data from contract photo
  const extractContract = async (imageData) => {
    try {
      const resp = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await resp.json();
      if (data.success && data.data) {
        const d = data.data;
        setRental(prev => ({
          ...prev,
          company: d.company || prev.company,
          car: d.car || prev.car,
          plate: d.plate || prev.plate,
          start: d.start || prev.start,
          end: d.end || prev.end,
          dailyPrice: d.dailyPrice ? String(d.dailyPrice) : prev.dailyPrice,
          insurance: d.insurance || prev.insurance,
          excess: d.excess ? String(d.excess) : prev.excess,
          mileage: d.mileage || prev.mileage,
          fuel: d.fuel || prev.fuel,
          deposit: d.deposit ? String(d.deposit) : prev.deposit,
          notes: d.notes ? (prev.notes ? prev.notes + "\\n" + d.notes : d.notes) : prev.notes,
        }));
      }
    } catch {}
  };

  const doFile = (e) =>`
);

// 2. Modify the contract photo handler to also extract data
// Find where contractP photos are added and trigger extraction
c = c.replace(
  `<Photos title="Contract & Documents" icon=`,
  `<Photos title="Contract & Documents" icon=`
);

// Add extraction trigger: when a contract photo is added, send it for extraction
// We need to modify the handlePhoto for contracts specifically
// Add a wrapper function that both stores the photo AND sends for extraction
c = c.replace(
  `<Photos title="Contract & Documents" icon="\u{1F4C4}" photos={contractP} setter={setContractP} guides={false} />`,
  `<Photos title="Contract & Documents" icon="\u{1F4C4}" photos={contractP} setter={(updater) => {
          // Wrap setter to also extract data from new photos
          setContractP(prev => {
            const newPhotos = typeof updater === 'function' ? updater(prev) : updater;
            // Find newly added photos and extract data
            const added = newPhotos.filter(p => !prev.find(e => e.id === p.id));
            added.forEach(p => extractContract(p.data));
            return newPhotos;
          });
        }} guides={false} />`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('Done! App.jsx updated with contract photo extraction.');
console.log('When a user uploads a contract photo:');
console.log('  1. Photo is stored locally (as before)');
console.log('  2. Photo is sent to Claude Vision for data extraction');
console.log('  3. Rental form fields are auto-filled');
console.log('  4. Market data is stored in Redis');
