(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-talk-like-list"],{"040d":function(t,e,n){"use strict";n.r(e);var i=n("f035"),o=n("c394");for(var u in o)["default"].indexOf(u)<0&&function(t){n.d(e,t,(function(){return o[t]}))}(u);var a=n("f0c5"),l=Object(a["a"])(o["default"],i["b"],i["c"],!1,null,"7c45acc8",null,!1,i["a"],void 0);e["default"]=l.exports},"075d":function(t,e,n){"use strict";(function(t){n("7a82"),Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var i=t.database(),o={data:function(){return{collectionList:[i.collection("talk-like").where("user_id==$cloudEnv_uid").getTemp(),i.collection("talk-article").field("_id,title").getTemp()],loadMore:{contentdown:"",contentrefresh:"",contentnomore:""}}},onPullDownRefresh:function(){this.$refs.udb.loadData({clear:!0},(function(){uni.stopPullDownRefresh()}))},onReachBottom:function(){this.$refs.udb.loadMore()},methods:{handleItemClick:function(t){uni.navigateTo({url:"/pages/detail/detail?id="+t})}}};e.default=o}).call(this,n("a9ff")["default"])},c394:function(t,e,n){"use strict";n.r(e);var i=n("075d"),o=n.n(i);for(var u in i)["default"].indexOf(u)<0&&function(t){n.d(e,t,(function(){return i[t]}))}(u);e["default"]=o.a},f035:function(t,e,n){"use strict";n.d(e,"b",(function(){return o})),n.d(e,"c",(function(){return u})),n.d(e,"a",(function(){return i}));var i={unicloudDb:n("960d").default,uniList:n("310c").default,uniListItem:n("36e7").default,uniLoadMore:n("b606").default},o=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-uni-view",{staticClass:"container"},[n("unicloud-db",{ref:"udb",attrs:{orderby:"like_date desc",collection:t.collectionList,field:"article_id,user_id,like_date"},scopedSlots:t._u([{key:"default",fn:function(e){var i=e.data,o=(e.pagination,e.loading),u=e.hasMore,a=e.error;return[a?n("v-uni-view",[t._v(t._s(a.message))]):i?n("v-uni-view",[n("uni-list",t._l(i,(function(e,i){return n("uni-list-item",{key:i,attrs:{showArrow:!0,clickable:!0},on:{click:function(n){arguments[0]=n=t.$handleEvent(n),t.handleItemClick(e.article_id[0]._id)}},scopedSlots:t._u([{key:"body",fn:function(){return[n("v-uni-text",[t._v(t._s(e.article_id[0].title))])]},proxy:!0}],null,!0)})})),1)],1):t._e(),n("uni-load-more",{attrs:{status:o?"loading":u?"more":"noMore"}})]}}])})],1)},u=[]}}]);