import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../../constants/theme';
import { MBARARA_STAGES, TransitStage } from '../../constants/mbararaStages';

interface OpenStreetMapProps {
  stages?: TransitStage[];
  selectedStage?: TransitStage | null;
  pickupStage?: TransitStage | null;
  destinationStage?: TransitStage | null;
  onSelectStage?: (stage: TransitStage) => void;
  height?: number | string;
  showAllStages?: boolean;
}

export const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  stages = MBARARA_STAGES,
  selectedStage,
  pickupStage,
  destinationStage,
  onSelectStage,
  height = 360,
  showAllStages = true,
}) => {
  const webViewRef = useRef<any>(null);

  // Center around Mbarara Town (-0.6072, 30.6585)
  const defaultCenter = selectedStage
    ? [selectedStage.latitude, selectedStage.longitude]
    : pickupStage
    ? [pickupStage.latitude, pickupStage.longitude]
    : [-0.6072, 30.6585];

  // Pass current stages and focus to HTML
  const stagesToRender = showAllStages
    ? stages
    : [pickupStage, destinationStage].filter(Boolean) as TransitStage[];

  const leafletHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      touch-action: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      background-color: #f1f5f9;
    }
    #map {
      height: 100%;
      width: 100%;
      touch-action: none;
    }
    .custom-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: white;
      font-weight: bold;
      font-size: 11px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.35);
      border: 2px solid white;
    }
    .marker-pickup {
      background: #10B981;
    }
    .marker-destination {
      background: #EF4444;
    }
    .marker-selected {
      background: #1D4ED8;
      transform: scale(1.2);
    }
    .marker-hub {
      background: #2563EB;
    }
    .marker-standard {
      background: #475569;
    }
    .leaflet-popup-content-wrapper {
      border-radius: 10px;
      padding: 2px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.18);
    }
    .popup-title {
      font-weight: bold;
      color: #0F172A;
      font-size: 13px;
      margin-bottom: 3px;
    }
    .popup-desc {
      color: #475569;
      font-size: 11px;
      line-height: 1.3;
    }
    .popup-badge {
      display: inline-block;
      margin-top: 4px;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 600;
      background: #DBEAFE;
      color: #1D4ED8;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([${defaultCenter[0]}, ${defaultCenter[1]}], 14);

    // OpenStreetMap standard tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Prevent touch gestures inside map from propagating out to parent React Native scrollviews
    var mapEl = document.getElementById('map');
    function stopScrollPropagation(e) {
      e.stopPropagation();
    }
    mapEl.addEventListener('touchstart', stopScrollPropagation, { passive: false });
    mapEl.addEventListener('touchmove', stopScrollPropagation, { passive: false });
    mapEl.addEventListener('touchend', stopScrollPropagation, { passive: false });

    var stagesData = ${JSON.stringify(stagesToRender)};
    var selectedId = "${selectedStage ? selectedStage.id : ''}";
    var pickupId = "${pickupStage ? pickupStage.id : ''}";
    var destinationId = "${destinationStage ? destinationStage.id : ''}";

    var markersMap = {};
    var boundsPoints = [];

    stagesData.forEach(function(s) {
      var isPickup = (s.id === pickupId);
      var isDest = (s.id === destinationId);
      var isSel = (s.id === selectedId);

      var markerClass = 'marker-standard';
      var markerLabel = '•';

      if (isPickup) {
        markerClass = 'marker-pickup';
        markerLabel = 'P';
      } else if (isDest) {
        markerClass = 'marker-destination';
        markerLabel = 'D';
      } else if (isSel) {
        markerClass = 'marker-selected';
        markerLabel = '★';
      } else if (s.isMajorHub) {
        markerClass = 'marker-hub';
        markerLabel = 'H';
      }

      var icon = L.divIcon({
        className: '',
        html: '<div class="custom-marker ' + markerClass + '" style="width:24px;height:24px;">' + markerLabel + '</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      var marker = L.marker([s.latitude, s.longitude], { icon: icon }).addTo(map);
      
      var popupContent = 
        '<div class="popup-title">' + s.name + '</div>' +
        '<div class="popup-desc">' + s.description + '</div>' +
        '<span class="popup-badge">' + s.division + ' Division</span>';

      marker.bindPopup(popupContent);

      marker.on('click', function() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STAGE_CLICKED', stageId: s.id }));
        }
      });

      markersMap[s.id] = marker;
      boundsPoints.push([s.latitude, s.longitude]);

      if (isSel || isPickup) {
        marker.openPopup();
      }
    });

    // Draw route line if pickup and destination exist
    ${
      pickupStage && destinationStage
        ? `
        var latlngs = [
          [${pickupStage.latitude}, ${pickupStage.longitude}],
          [${destinationStage.latitude}, ${destinationStage.longitude}]
        ];
        var polyline = L.polyline(latlngs, {
          color: '#1D4ED8',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8'
        }).addTo(map);
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      `
        : `
        if (selectedId && markersMap[selectedId]) {
          map.panTo(markersMap[selectedId].getLatLng());
        }
      `
    }

    // Handle messages sent from React Native
    window.focusStage = function(lat, lng, stageId) {
      map.flyTo([lat, lng], 15, { duration: 1 });
      if (markersMap[stageId]) {
        markersMap[stageId].openPopup();
      }
    };
  </script>
</body>
</html>
  `;

  // Focus stage whenever selectedStage changes
  useEffect(() => {
    if (selectedStage && webViewRef.current) {
      const script = `
        if (window.focusStage) {
          window.focusStage(${selectedStage.latitude}, ${selectedStage.longitude}, "${selectedStage.id}");
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [selectedStage]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'STAGE_CLICKED' && onSelectStage) {
        const found = stages.find((s) => s.id === data.stageId);
        if (found) {
          onSelectStage(found);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={[styles.container, { height: height as any }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*'] as any}
        source={{ html: leafletHtml }}
        style={styles.webView as any}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
        startInLoadingState={true}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
