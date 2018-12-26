/**
 * 懒加载
 */

export default class LazyLoad {
    constructor(context, opt = {}) {
        this.page = context;

        this.classNote = opt.classNote || 'item-';
        this.initNum = opt.initNum || 5;
        this.limit = opt.limit || 5;

        this.intersectionObserver = {};

        this.page.setData({
            autoCount: this.initNum
        });

        if (!this.isSupport()) console.error('wx.createIntersectionObserver is not a function')

    }

    observe() {
        if (!this.isSupport()) return;
        const that = this;
        this.intersectionObserver = wx.createIntersectionObserver();

        this.intersectionObserver.relativeToViewport({bottom: 100}).observe(this.classNote + this.page.data.autoCount, (res) => {
            if (res.boundingClientRect.top > 0) {
                that.intersectionObserver.disconnect();
                that.page.setData({
                    autoCount: that.page.data.autoCount + that.limit
                });
                that.observe();
            }
        })
    }

    isSupport() {
        return !!wx.createIntersectionObserver
    }
}