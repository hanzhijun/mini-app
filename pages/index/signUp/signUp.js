const app = getApp();

Page({
    data: {
        result: [],
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        config: {           // 配置签到奖励
            1: [7, 'seven'],
            2: [15, 'fifteen'],
            3: [28, 'twenty_eight']
        }
    },

    onLoad: function (options) {
        this.init();
    },

    init: function () {
        // 获取页面数据
        app.post('sign/signIndex', {}, (res) => {
            this.setData({
                result: res.data
            })
        })
    },

    // 立即领取
    receiveReward(e) {
        let {type} = e.currentTarget.dataset;
        app.post('sign/receiveReward', {
            type
        }, (res) => {
            if (res.code == 200) {
                app.alert('领取成功！', 'success', () => {
                    this.init();
                });
            } else {
                app.alert(res.info, 'none');
            }
        })
    },

    // 点击签到
    signIn: function () {
        let {result} = this.data;
        app.post('sign/signIn', {}, (res) => {
            if (res.code == 200) {
                app.alert('签到成功！', 'success', () => {
                    this.init();
                });
            } else {
                app.alert(res.info, 'none');
            }
        })
    }
});