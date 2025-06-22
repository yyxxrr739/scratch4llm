import { gsap } from "gsap";

class AnimationService {
  constructor() {
    this.timelines = new Map();
    this.animations = new Map();
  }

  // 创建时间线
  createTimeline(id, options = {}) {
    const timeline = gsap.timeline({
      paused: true,
      ...options
    });
    this.timelines.set(id, timeline);
    return timeline;
  }

  // 获取时间线
  getTimeline(id) {
    return this.timelines.get(id);
  }

  // 销毁时间线
  destroyTimeline(id) {
    const timeline = this.timelines.get(id);
    if (timeline) {
      timeline.kill();
      this.timelines.delete(id);
    }
  }

  // 停止所有时间线
  stopAllTimelines() {
    this.timelines.forEach(timeline => {
      if (timeline && timeline.isActive()) {
        timeline.kill();
      }
    });
  }

  // 创建动画
  createAnimation(id, element, animationConfig) {
    const animation = gsap.to(element, animationConfig);
    this.animations.set(id, animation);
    return animation;
  }

  // 获取动画
  getAnimation(id) {
    return this.animations.get(id);
  }

  // 销毁动画
  destroyAnimation(id) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.kill();
      this.animations.delete(id);
    }
  }

  // 清理所有动画
  cleanup() {
    this.timelines.forEach(timeline => timeline.kill());
    this.animations.forEach(animation => animation.kill());
    this.timelines.clear();
    this.animations.clear();
  }
}

export default AnimationService; 