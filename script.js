let intervalId = null;

function getData() {
  const data = localStorage.getItem("artikelList");
  return data ? JSON.parse(data) : [];
}

function simpanData(data) {
  localStorage.setItem("artikelList", JSON.stringify(data));
}

function isTempat(text) {
  const kataTempat = [
  "tempat", "provinsi", "kota", "kabupaten", "desa",
  "pulau", "benua", "negara", "kecamatan", "wilayah"
  ];
  for (let kata of kataTempat) {
    if (text.toLowerCase().includes(kata)) {
      return true;
    }
  }
  return false;
}

async function getWikipedia() {
  const res = await fetch('https://id.wikipedia.org/api/rest_v1/page/random/summary');
  const data = await res.json();

  const tipeTempat = isTempat(data.extract);

  const artikel = {
    title: data.title,
    summary: data.extract,
    url: data.content_urls.desktop.page,
    tipe: tipeTempat ? "Tempat" : "Bukan Tempat"
  };

  const artikelList = getData();
  artikelList.push(artikel);
  simpanData(artikelList);

  tampilkanArtikel();
}

function tampilkanArtikel() {
  const artikelList = getData();

  const outputSemua = document.getElementById("output-semua");
  const outputTempat = document.getElementById("output-tempat");

  outputSemua.innerHTML = "";
  outputTempat.innerHTML = "";

  artikelList.forEach(a => {
    const truncatedSummary = a.summary.length > 100 
    ? a.summary.slice(0, 100) + "..." 
    : a.summary;

    const html = `<div class="card">
    <div class="card-header">
    <h3><a href="${a.url}" target="_blank">${a.title}</a></h3>
    </div><hr>
    <div class="card-body">
    ${truncatedSummary}
    </div><hr>
    <strong>${a.tipe}</strong> 
    </div>`;

    outputSemua.innerHTML += html;
    if (a.tipe === "Tempat") {
      outputTempat.innerHTML += html;
    }
  });

}

function saveToJSON() {
  const artikelList = getData();
  if (artikelList.length === 0) {
    alert("Storage Empty");
    return;
  }

  const jsonContent = JSON.stringify(artikelList, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "all.json";
  link.click();
}

function saveTempatToJSON() {
  const artikelList = getData().filter(a => a.tipe === "Tempat");
  if (artikelList.length === 0) {
    alert("Storage Empty");
    return;
  }

  const jsonContent = JSON.stringify(artikelList, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "place.json";
  link.click();
}

function hapusSemua() {
  localStorage.removeItem("artikelList");
  tampilkanArtikel();
  alert("All Data Removed from Local Storage.");
}

function toggleAuto() {
  const btn = document.getElementById("autoBtn");

  if (intervalId === null) {
    intervalId = setInterval(getWikipedia, 3000);
    btn.textContent = "Stop";
  } else {
    clearInterval(intervalId);
    intervalId = null;
    btn.textContent = "Auto";
  }
}

window.onload = () => {
  tampilkanArtikel();
};
