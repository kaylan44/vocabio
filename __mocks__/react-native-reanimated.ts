import React from 'react';
import { View, Text, TextInput, Image, ScrollView } from 'react-native';

const noop = () => {};
const noopWorklet = () => noop;

export const useSharedValue = (init: any) => ({ value: init });
export const useAnimatedStyle = (fn: () => any) => ({});
export const withTiming = (val: any) => val;
export const withSpring = (val: any) => val;
export const withSequence = (...vals: any[]) => vals[vals.length - 1];
export const withDelay = (_delay: number, val: any) => val;
export const withRepeat = (val: any) => val;
export const runOnJS = (fn: any) => fn;
export const runOnUI = (fn: any) => fn;
export const useAnimatedRef = () => ({ current: null });
export const useAnimatedScrollHandler = noopWorklet;
export const useDerivedValue = (fn: () => any) => ({ value: fn() });
export const cancelAnimation = noop;
export const interpolate = (val: number, _input: number[], output: number[]) => output[0];
export const Extrapolate = { CLAMP: 'clamp' };
export const useReducedMotion = () => false;
const identity = (t: number) => t;
const passThrough = (fn: (t: number) => number) => fn;
export const Easing = {
  linear: identity,
  cubic: identity,
  sin: identity,
  bezier: () => identity,
  in: passThrough,
  out: passThrough,
  inOut: passThrough,
};

export const createAnimatedComponent = (Component: React.ComponentType<any>) => Component;

const Animated = {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  createAnimatedComponent,
};

export default Animated;
