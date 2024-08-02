import React from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';
import './vehicleLocationMap.css'; 

class VehicleLocationMap extends React.Component {
  mapContainer = React.createRef();

  state = {
    vehicleData: [],
    currentLocation: { lat: 17.385044, lng: 78.486671 }
  };

  componentDidMount() {
    this.initMap();
    this.fetchVehicleData();
    this.interval = setInterval(this.fetchVehicleData, 5000); // Fetch data every 5 seconds
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  initMap = () => {
    console.log('Initializing map'); // Debugging statement
    this.map = new maplibregl.Map({
      container: this.mapContainer.current,
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',
      center: [78.486671, 17.385044],
      zoom: 15
    });

    this.map.on('load', () => {
      console.log('Map loaded'); // Debugging statement
      this.map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {},
        paint: {
          'line-color': '#FF0000',
          'line-width': 2
        }
      });
    });
  };

  fetchVehicleData = async () => {
    try {
      const response = await axios.get('https://blockback-9kuh.onrender.com/api/vehicle');
      console.log('Fetched vehicle data:', response.data); // Debugging statement
      this.setState({ vehicleData: [response.data] }); // Update state with single vehicle data
      this.updateMap([response.data]);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    }
  };

  updateMap = (vehicleData) => {
    if (this.map && vehicleData.length > 0) {
      console.log('Updating map with data:', vehicleData); // Debugging statement
      const coordinates = vehicleData.map(data => [data.longitude, data.latitude]);

      // Update marker
      new maplibregl.Marker()
        .setLngLat([vehicleData[0].longitude, vehicleData[0].latitude])
        .setPopup(new maplibregl.Popup().setText('Current Location'))
        .addTo(this.map);

      // Update route
      this.map.getSource('route').setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates
            }
          }
        ]
      });
    }
  };

  render() {
    return (
      <div className="map-container">
        <div ref={this.mapContainer} className="map"></div>
      </div>
    );
  }
}

export default VehicleLocationMap;
