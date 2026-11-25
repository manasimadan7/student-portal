import { createContext, useContext } from 'react'

export type Device = 'phone' | 'laptop'

export const DeviceContext = createContext<Device>('phone')
export const useDevice = () => useContext(DeviceContext)

const KEY = 'pp-student-device'

export function readDevice(): Device {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'phone' || v === 'laptop') return v
  } catch {
    /* storage blocked — fall through */
  }
  return 'phone'
}

export function saveDevice(d: Device) {
  try {
    localStorage.setItem(KEY, d)
  } catch {
    /* ignore */
  }
}
