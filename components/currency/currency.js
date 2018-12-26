// components/currency/currency.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: String,                // 货币拼音
    num: Array                   // 价格
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
    get() {
      console.log(this.data)
    }
  }
})
