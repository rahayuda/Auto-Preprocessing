let intervalId = null;

function getData() {
  const data = localStorage.getItem("artikelList");
  return data ? JSON.parse(data) : [];
}

function simpanData(data) {
  localStorage.setItem("artikelList", JSON.stringify(data));
}

// ===== Bagian Baru: Kata dan Skor Tempat =====
const jenisTempat = [
  "kota", "kabupaten", "kecamatan", "provinsi", "desa", 
  "pulau", "benua", "negara", "wilayah", "tempat", "ibu kota",
  "gunung", "sungai", "danau", "hutan", "taman", 
  "stasiun", "bandara", "pelabuhan", "planet", "galaksi", 
  "terminal", "jalan", "pasar", "gedung", "universitas", 
  "museum", "candi", "kuil", "monumen", "kebun binatang"
];

const frasaSkor3 = ["adalah sebuah", "adalah salah satu", "adalah nama", "adalah", "merupakan sebuah", "merupakan salah satu", "merupakan nama", "merupakan"];
const frasaSkor2 = ["terletak di", "berada di"];

// Auto-generate array kataTempat dengan skor
const kataTempat = [];

frasaSkor3.forEach(frasa => {
  jenisTempat.forEach(jenis => {
    kataTempat.push({ kata: `${frasa} ${jenis}`, skor: 10 });
  });
});

frasaSkor2.forEach(frasa => {
  kataTempat.push({ kata: frasa, skor: 2 });
});

jenisTempat.forEach(jenis => {
  kataTempat.push({ kata: jenis, skor: 1 });
});

// ====== Fungsi Baru: Penilaian Tempat dengan Skor ======
function isTempat(text) {
  let totalSkor = 0;
  const lowerText = text.toLowerCase();

  for (let item of kataTempat) {
    if (lowerText.includes(item.kata)) {
      totalSkor += item.skor;
    }
  }

  // Bisa disesuaikan threshold-nya
  return totalSkor >= 4;
}

async function getWikipedia() {
  const res = await fetch('https://id.wikipedia.org/api/rest_v1/page/random/summary');
  const data = await res.json();

  const tipeTempat = isTempat(data.extract);

  const artikel = {
    title: data.title,
    summary: data.extract,
    url: data.content_urls.desktop.page,
    tipe: tipeTempat ? "Place" : "Other"
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
    const truncatedSummary = a.summary.length > 90 
    ? a.summary.slice(0, 90) + "..." 
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
    if (a.tipe === "Place") {
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
  const artikelList = getData().filter(a => a.tipe === "Place");
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
