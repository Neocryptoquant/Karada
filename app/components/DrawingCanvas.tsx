'use client';

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';

interface DrawStroke {
  points: number[];
  color: string;
  width: number;
}

interface DrawingCanvasProps {
  isDrawer: boolean;
  strokes: DrawStroke[];
  onAddStroke?: (stroke: DrawStroke) => void;
  width?: number;
  height?: number;
}

const COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF6B9D', // Pink
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#FF6B6B', // Red
  '#95E1D3', // Mint
  '#A29BFE', // Purple
  '#FD79A8', // Hot Pink
  '#FDCB6E', // Orange
  '#00B894', // Green
  '#0984E3', // Blue
];

export default function DrawingCanvas({
  isDrawer,
  strokes,
  onAddStroke,
  width = 800,
  height = 600,
}: DrawingCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<number[]>([]);

  const handleMouseDown = (e: any) => {
    if (!isDrawer) return;

    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setCurrentLine([pos.x, pos.y]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !isDrawer) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setCurrentLine([...currentLine, point.x, point.y]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !isDrawer) return;

    setIsDrawing(false);

    if (currentLine.length > 0 && onAddStroke) {
      const stroke: DrawStroke = {
        points: currentLine,
        color: tool === 'eraser' ? '#FFFFFF' : color,
        width: tool === 'eraser' ? brushSize * 2 : brushSize,
      };
      onAddStroke(stroke);
    }

    setCurrentLine([]);
  };

  const handleClear = () => {
    if (onAddStroke) {
      // Clear by adding a white rectangle stroke
      onAddStroke({
        points: [0, 0, width, 0, width, height, 0, height],
        color: '#FFFFFF',
        width: 1,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-4 border-gray-200">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          className={isDrawer ? 'cursor-crosshair' : 'cursor-not-allowed'}
        >
          <Layer>
            {/* Background */}
            <Line
              points={[0, 0, width, 0, width, height, 0, height]}
              fill="#FFFFFF"
              closed
            />

            {/* All strokes */}
            {strokes.map((stroke, i) => (
              <Line
                key={i}
                points={stroke.points}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"
              />
            ))}

            {/* Current drawing line */}
            {isDrawing && currentLine.length > 0 && (
              <Line
                points={currentLine}
                stroke={tool === 'eraser' ? '#FFFFFF' : color}
                strokeWidth={tool === 'eraser' ? brushSize * 2 : brushSize}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Tools (only show if drawer) */}
      {isDrawer && (
        <div className="card space-y-4">
          {/* Color Picker */}
          <div>
            <p className="text-sm font-semibold mb-2">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setTool('pen');
                  }}
                  className={`w-10 h-10 rounded-lg border-4 transition-all ${
                    color === c && tool === 'pen'
                      ? 'border-pink-500 scale-110'
                      : 'border-gray-300'
                  }`}
                  style={{
                    backgroundColor: c,
                    boxShadow: c === '#FFFFFF' ? '0 0 0 1px #ddd inset' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div>
            <p className="text-sm font-semibold mb-2">
              Brush Size: {brushSize}px
            </p>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Tools */}
          <div className="flex gap-2">
            <button
              onClick={() => setTool('pen')}
              className={`btn flex-1 ${
                tool === 'pen' ? 'btn-primary' : 'bg-gray-200'
              }`}
            >
              Pen
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`btn flex-1 ${
                tool === 'eraser' ? 'btn-primary' : 'bg-gray-200'
              }`}
            >
              Eraser
            </button>
            <button onClick={handleClear} className="btn btn-accent">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Viewer message */}
      {!isDrawer && (
        <div className="text-center text-gray-600 py-4">
          Watch and guess what's being drawn!
        </div>
      )}
    </div>
  );
}
