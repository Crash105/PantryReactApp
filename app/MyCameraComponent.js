import React, { useState } from 'react';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';

const MyCameraComponent = () => {
  const [isOn, setIsOn] = useState(false);

  const handleTakePhoto = (dataUri) => {
    console.log('Photo taken:', dataUri);
  };

  const handleCameraStart = (stream) => {
    console.log('Camera started:', stream);
  };

  const handleCameraStop = () => {
    console.log('Camera stopped');
  };

  return (
    <div>
      {isOn && (
        <Camera
          onTakePhoto={(dataUri) => { handleTakePhoto(dataUri); }}
          onCameraStart={(stream) => { handleCameraStart(stream); }}
          onCameraStop={() => { handleCameraStop(); }}
        />
      )}
      <button onClick={() => setIsOn(!isOn)}>
        {isOn ? 'Turn off' : 'Turn on'} Camera
      </button>
    </div>
  );
};

export default MyCameraComponent;
