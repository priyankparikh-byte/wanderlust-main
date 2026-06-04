(() => {
  "use strict";

  document.querySelectorAll(".needs-validation").forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });

  const mapContainer = document.getElementById("listingMap");
  if (!mapContainer) return;

  const query = [mapContainer.dataset.location, mapContainer.dataset.country]
    .filter(Boolean)
    .join(", ");

  if (!query) {
    mapContainer.classList.add("listing-map--empty");
    mapContainer.textContent = "Location not available.";
    return;
  }

  mapContainer.classList.add("listing-map--loading");
  const iframe = document.createElement("iframe");
  iframe.className = "listing-map-iframe";
  iframe.setAttribute("allowfullscreen", "");
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
  iframe.onload = () => {
    mapContainer.classList.remove("listing-map--loading");
    mapContainer.classList.add("listing-map--ready");
  };
  mapContainer.appendChild(iframe);
})();