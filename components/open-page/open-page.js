const {openPage} = getApp();


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    url: String
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
    openPage: function(e) {
      let { url } = e.currentTarget.dataset;
      url && openPage(url);
    }
  }
})
