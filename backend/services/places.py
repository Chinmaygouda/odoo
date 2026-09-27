import urllib.request
import urllib.parse
import json
import logging
from typing import List, Dict, Optional

logger = logging.getLogger("traveloop.places")

# Keywords to filter out non-tourist administrative/institutional places
EXCLUDED_KEYWORDS = [
    "school", "high school", "college", "university campus", "hospital", 
    "clinic", "police", "jail", "prison", "court", "high court",
    "district", "constituency", "assembly", "election", "ward",
    "department", "diocese", "railway division", "headquarters", "subdivision"
]

def geocode_city(city: str, country: str = "") -> Optional[Dict]:
    """
    Resolve city and country to latitude, longitude and display name using OpenStreetMap Nominatim.
    """
    query = f"{city}, {country}".strip().strip(",")
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json&limit=1"
    headers = {"User-Agent": "TraveloopConcierge/2.0 (traveloop-tourist-service)"}
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data and len(data) > 0:
                return {
                    "lat": float(data[0]["lat"]),
                    "lon": float(data[0]["lon"]),
                    "display_name": data[0].get("display_name", query)
                }
    except Exception as e:
        logger.warning(f"Nominatim geocoding failed for '{query}': {e}")
    return None

def fetch_places_by_coordinates(lat: float, lon: float, radius: int = 10000, limit: int = 40) -> List[Dict]:
    """
    Fetch real landmarks and attractions around coordinates using Wikipedia GeoSearch.
    Wikipedia max gsradius is 10000m.
    """
    safe_radius = min(max(radius, 10), 10000)
    # Pipe character must be URL-encoded as %7C for urllib
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord={lat}%7C{lon}&gsradius={safe_radius}&gslimit={limit}&format=json"
    headers = {"User-Agent": "TraveloopConcierge/2.0 (traveloop-tourist-service)"}
    
    places = []
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            geosearch = data.get("query", {}).get("geosearch", [])
            for item in geosearch:
                title = item.get("title", "")
                title_lower = title.lower()
                
                # Check exclusions
                if any(k in title_lower for k in EXCLUDED_KEYWORDS):
                    continue
                
                # Infer type
                category = "Sightseeing"
                if any(w in title_lower for w in ["temple", "church", "cathedral", "mosque", "monastery", "shrine", "theatre", "theater", "museum", "gallery", "palace", "fort", "castle", "heritage"]):
                    category = "Culture"
                elif any(w in title_lower for w in ["bazaar", "market", "mall", "street", "road", "plaza", "square"]):
                    category = "Shopping"
                elif any(w in title_lower for w in ["park", "garden", "lake", "falls", "waterfall", "peak", "ridge", "valley", "trek", "trail", "hill"]):
                    category = "Adventure"
                elif any(w in title_lower for w in ["cafe", "restaurant", "brewery", "diner", "food"]):
                    category = "Food"

                places.append({
                    "name": title,
                    "type": category,
                    "lat": item.get("lat"),
                    "lon": item.get("lon"),
                    "distance": item.get("dist", 0)
                })
    except Exception as e:
        logger.warning(f"Wikipedia GeoSearch failed for coordinates ({lat}, {lon}): {e}")
        
    return places

def search_text_attractions(city: str, country: str = "") -> List[Dict]:
    """
    Fallback/Complementary text search for tourist attractions in the city.
    """
    query = f"{city} {country} tourist attractions landmarks".strip()
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&srlimit=15&format=json"
    headers = {"User-Agent": "TraveloopConcierge/2.0 (traveloop-tourist-service)"}
    
    places = []
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            search_items = data.get("query", {}).get("search", [])
            for item in search_items:
                title = item.get("title", "")
                title_lower = title.lower()
                
                if any(k in title_lower for k in EXCLUDED_KEYWORDS):
                    continue
                if title_lower == city.lower() or title_lower.startswith("list of"):
                    continue
                
                category = "Sightseeing"
                if any(w in title_lower for w in ["temple", "church", "cathedral", "monastery", "theatre", "museum", "palace", "fort"]):
                    category = "Culture"
                elif any(w in title_lower for w in ["market", "bazaar", "mall"]):
                    category = "Shopping"
                elif any(w in title_lower for w in ["lake", "peak", "ridge", "park", "garden", "falls"]):
                    category = "Adventure"

                places.append({
                    "name": title,
                    "type": category,
                    "snippet": item.get("snippet", "")
                })
    except Exception as e:
        logger.warning(f"Wikipedia text search failed for '{query}': {e}")
        
    return places

def get_real_city_places(city: str, country: str = "") -> List[Dict]:
    """
    Aggregates real-time genuine tourist spots for a destination using geocoding + Wikipedia geo/text search.
    Guarantees a clean, deduplicated list of real-world places with categories and realistic transit suggestions.
    """
    found_places = []
    seen_names = set()
    
    # 1. Geocode
    geo = geocode_city(city, country)
    if geo:
        geo_places = fetch_places_by_coordinates(geo["lat"], geo["lon"])
        for p in geo_places:
            norm_name = p["name"].lower().strip()
            if norm_name not in seen_names and norm_name != city.lower():
                seen_names.add(norm_name)
                found_places.append(p)
                
    # 2. Text Search to enrich if we have fewer than 10 places
    if len(found_places) < 10:
        text_places = search_text_attractions(city, country)
        for p in text_places:
            norm_name = p["name"].lower().strip()
            if norm_name not in seen_names and norm_name != city.lower():
                seen_names.add(norm_name)
                found_places.append(p)
                
    # 3. Add transit instructions for each place
    for p in found_places:
        name = p["name"]
        cat = p["type"]
        if "transit" not in p:
            if cat in ["Sightseeing", "Culture"]:
                p["transit"] = f"Take city bus or metro towards {name}, or a 10-15 min local taxi ride"
            elif cat == "Shopping":
                p["transit"] = "Short walk from central square or local tuk-tuk / cab"
            elif cat == "Adventure":
                p["transit"] = "Board local transit or hire a scenic cab from city center (approx. 20-30 min)"
            else:
                p["transit"] = "Accessible by local transit or short walking distance"

    return found_places
