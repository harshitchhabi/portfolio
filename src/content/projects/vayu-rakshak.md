---
order: 2
slug: vayu-rakshak
title: 'Vayu Rakshak: HCHO Pollution Hotspot Detection'
daemon: Vayu
pid: 2207
oneLiner: Formaldehyde hotspots from Sentinel-5P, checked against real fires and tied to ground AQI.
type: ML
year: '2026'
role: Primary developer and builder
team: Team GEMs, Bharatiya Antariksh Hackathon 2026
stack: [Python, scikit-learn, XGBoost, Streamlit, Google Earth Engine]
repo: https://github.com/harshitchhabi/S5P
metrics:
  - { label: 'Area AQI R², 2025-26 (unseen years)', value: '0.83' }
  - { label: City-days in training, value: '255,807' }
  - { label: Stations in out-of-time check, value: '519' }
stamp: VERIFIED
cover: ../../assets/projects/vayu-rakshak/cover.png
coverAlt: Vaayu Rakshak's dashboard, with today's AQI for Delhi, the day picker from satellite day to two-day forecast, and the India map of CPCB cities over the satellite estimate.
shots:
  - src: ../../assets/projects/vayu-rakshak/city.png
    alt: Pithampur up close, Very Poor at 309, with its week from satellite day to forecast and the day's most and least polluted cities.
---

## What was wrong

Every October and November, stubble burning in Punjab and Haryana sends smoke across north India. Ground monitors are sparse outside big cities, so most of the affected area has no direct measurement. Satellites see the whole region every day, but a raw formaldehyde (HCHO) map is noisy and doesn't tell you what's burning or what people are breathing.

## What I built

I pull Sentinel-5P TROPOMI HCHO columns through Google Earth Engine and grid them at 0.25° (about 28 km). A z-score test on the HCHO grid flags hotspots. Each hotspot is then matched against NASA FIRMS active-fire detections from the last 7 days, so a high reading with no fire nearby gets treated with suspicion instead of reported. Confirmed hotspots are correlated with AQI from CPCB monitors.

The trade-off: I tried XGBoost for the AQI model and dropped it. Early stopping was unstable and it scored worse (MAE 30.75) than a random forest, which also gives a cheap uncertainty band.

## What happened

The project grew past the hackathon into Vaayu Rakshak, a satellite AQI map for all of India. Pick a city or click anywhere on the map for its AQI: a nowcast anchored to the day's CPCB bulletin, a satellite day before it and a forecast two days ahead, with city rankings and a fire/HCHO hotspot layer. Scored on years it never saw (Jan 2025 to Oct 2026, 519 stations), the area-level AQI estimate reaches R² 0.83 with an error of about ±19 AQI points.

Built at Bharatiya Antariksh Hackathon 2026 with Team GEMs, then extended for Smart India Hackathon 2026.

<!-- TODO(harshit): how many hotspots matched a FIRMS fire in the 2023 season. -->
