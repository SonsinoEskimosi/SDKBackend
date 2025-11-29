"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecorderManager = void 0;
class RecorderManager {
    constructor() {
        this.recorders = new Map();
    }
    register(recorder) {
        this.recorders.set(recorder.name, recorder);
    }
    get(name) {
        return this.recorders.get(name);
    }
    startAll() {
        this.recorders.forEach(recorder => recorder.start());
    }
    stopAll() {
        this.recorders.forEach(recorder => recorder.stop());
    }
    getAllData() {
        const data = {};
        this.recorders.forEach((recorder, name) => {
            data[name] = recorder.getData();
        });
        return data;
    }
}
exports.RecorderManager = RecorderManager;
