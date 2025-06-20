import React, { useState, useEffect } from 'react';
import './ActionControls.css';

const WheelControls = ({ 
  wheelSpeed = 1,
  onWheelSpeedChange 
}) => {
  const [speed, setSpeed] = useState(wheelSpeed);

  // 轮胎半径（米）- 普通SUV轮胎
  const TIRE_RADIUS = 0.35;
  
  // 基础转速（转/分钟）- 假设1x对应60转/分钟
  const BASE_RPM = 60;

  useEffect(() => {
    setSpeed(wheelSpeed);
  }, [wheelSpeed]);

  const handleSpeedChange = (event) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
    onWheelSpeedChange(newSpeed);
  };

  // 计算车速（km/h）
  const calculateVehicleSpeed = (speedMultiplier) => {
    const rpm = BASE_RPM * speedMultiplier;
    const circumference = 2 * Math.PI * TIRE_RADIUS; // 轮胎周长（米）
    const speedMps = (rpm * circumference) / 60; // 速度（米/秒）
    const speedKmh = speedMps * 3.6; // 转换为km/h
    return speedKmh;
  };

  // 将km/h转换为速度倍数
  const kmhToSpeedMultiplier = (kmh) => {
    if (kmh <= 0) {
      return 0;
    }
    const circumference = 2 * Math.PI * TIRE_RADIUS;
    const speedMps = kmh / 3.6;
    const rpm = (speedMps * 60) / circumference;
    return rpm / BASE_RPM;
  };

  // 将速度倍数转换为km/h
  const speedMultiplierToKmh = (multiplier) => {
    return calculateVehicleSpeed(multiplier);
  };

  // 当前速度对应的km/h
  const currentSpeedKmh = speedMultiplierToKmh(speed);

  return (
    <div className="wheel-controls">
      <div className="control-section">
        <h3 className="section-title">车轮控制</h3>
        
        <div className="speed-control">
          <div className="speed-header">
            <span className="speed-label">旋转速度</span>
            <span className="speed-value">{currentSpeedKmh.toFixed(1)} km/h</span>
          </div>
          
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              value={currentSpeedKmh}
              onChange={(event) => {
                const newKmh = parseFloat(event.target.value);
                const newMultiplier = kmhToSpeedMultiplier(newKmh);
                setSpeed(newMultiplier);
                onWheelSpeedChange(newMultiplier);
              }}
              className="speed-slider"
            />
            <div className="slider-labels">
              <span>0 km/h</span>
              <span>30 km/h</span>
            </div>
          </div>
        </div>

        <div className="wheel-info">
          <div className="info-item">
            <span className="info-icon">🔄</span>
            <span className="info-text">
              {currentSpeedKmh > 0 ? '车轮正在旋转' : '车轮已停止'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-icon">⚡</span>
            <span className="info-text">车速: {currentSpeedKmh.toFixed(1)} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelControls; 