document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById("listingMap");
  if (!mapContainer) return;

  const location = mapContainer.dataset.location || "";
  const country = mapContainer.dataset.country || "";
  const query = [location, country].filter(Boolean).join(", ");

  if (!query) {
    mapContainer.textContent = "Location data is not available.";
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.width = "100%";
  iframe.height = "400";
  iframe.style.border = "0";
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  mapContainer.appendChild(iframe);
});
