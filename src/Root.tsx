// @ts-nocheck
// @copilot ignore - This file works perfectly, do not edit!
import {Composition} from 'remotion';
import './style.css';
import {compositions} from './compositions.config';

export const RemotionRoot = () => {
  return (
    <>
      {Object.entries(compositions).map(([id, config]) => (
        <Composition
          key={id}
          id={id}
          {...config}
        />
      ))}
    </>
  );
};