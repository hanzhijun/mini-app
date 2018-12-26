const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    phone_msg: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchPage(e) {
      let { type } = e.currentTarget.dataset;
      if(type == 1) {
        wx.switchTab({
          url: `/pages/index/index`,
          success: function() {
            let page = getCurrentPages().pop();
            if(!page) return ;
            page.onLoad();
          }
        })
      } else if(type == 2) {
        // app.openPage('shopCart/shopCart')
        wx.switchTab({
          url: '/pages/shopCart/shopCart'
        })
      } else if(type == 3) {
        wx.switchTab({
          url: `/pages/mine/mine`,
          success: function () {
            let page = getCurrentPages().pop();
            if (!page) return;
            page.onLoad();
          }
        })
      }
    }
  }
})
