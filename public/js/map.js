
const mapElement = document.getElementById("map");

if (mapElement) {
  let coordinates;
  try {
    coordinates = JSON.parse(mapElement.dataset.coords);
    if (!Array.isArray(coordinates) || coordinates.length !== 2 || coordinates.includes(undefined)) {
      throw new Error("Invalid coordinates");
    }

    const title = mapElement.dataset.title;
    const Listinglocation = mapElement.dataset.location;

    const map = L.map("map").setView([coordinates[1], coordinates[0]], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const redIcon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.marker([coordinates[1], coordinates[0]], { icon: redIcon })
      .addTo(map)
      .bindPopup(`<b>${title}</b><br>${Listinglocation}`)
      .openPopup();

  } catch (err) {
    console.error("Error initializing map:", err);
    mapElement.innerHTML = `<p class="text-danger">Map could not be loaded due to invalid location data.</p>`;
  }
}
