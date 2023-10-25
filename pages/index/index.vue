<template>
	<view class="home">
		<view class="nav">
			<u-tabs :list="tabList" @click="clickTab" :activeStyle="{
            color: '#333',
            fontWeight: 'bold',
            transform: 'scale(1.05)'
        }"></u-tabs>
		</view>
		<view class="loading" v-if="isloading">
			<u-skeleton rows="3" title loading></u-skeleton>
		</view>
		<view class="content">
			<view class="item" v-for="(item,index) in dataList">
				<blogItem :blogItem="item" :isLike.sync="item.isLike" :like_count.sync="item.like_count"
					@delItem="delItem">
				</blogItem>
			</view>
		</view>
		<uni-load-more :status="loadMore"></uni-load-more>
		<view class="edit" @click="gotoEditor">
			<span class="iconfont icon-fabu"></span>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database()
	const dbCmd = db.command
	export default {
		data() {
			return {
				tabList: [{
						name: "最新",
						type: "publish_date"
					},
					{
						name: "热门",
						type: "view_count"
					}
				],
				tabIndex: 0,
				// 骨架屏
				isloading: false,
				dataList: [],
				// 下拉加载
				loadMore: 'more',
				// 是否已到底
				noMore: false
			}
		},
		onLoad() {
			this.getData()
		},
		onReachBottom() {
			this.loadMore = 'loading'
			if (this.noMore) {
				return this.loadMore = 'noMore'
			}
			this.getData()
		},
		methods: {
			delItem() {
				this.dataList = []
				this.getData()
			},
			async getData() {
				let article = await db.collection('talk-article').where('delStatus!=true').field(
					"title,user_id,desc,picUrl,comment_count,like_count,view_count,publish_date").getTemp()
				let user = await db.collection('uni-id-users').field("_id,username,avatar_file").getTemp()
				db.collection(article, user).orderBy(this.tabList[this.tabIndex].type, 'desc').skip(this.dataList
					.length).limit(5).get().then(
					async res => {
						// 已经到底了
						if (res.result.data.length < 5) {
							this.noMore = true
						}
						// 加载更多数据,将旧的数和新的数据拼接
						res.result.data = [...this.dataList, ...res.result.data]

						// 每篇文章ID
						let idArr = res.result.data.map(item => item._id)
						let likeRes = await db.collection('talk-like').where({
							article_id: dbCmd.in(idArr),
							user_id: uniCloud.getCurrentUserInfo().uid
						}).get()
						// 找到登录用户点赞的文章

						likeRes.result.data.forEach(item => {
							let index = 0

							for (index = 0; index < res.result.data.length; index++) {
								if (item.article_id === res.result.data[index]._id) {
									break
								}
							}
							res.result.data[index].isLike = true

						})

						this.dataList = res.result.data
						this.isloading = false

					})

			},
			clickTab(e) {
				// console.log(e);
				this.isloading = true
				this.dataList = []
				this.loadMore = 'more'
				this.noMore = false
				this.tabIndex = e.index
				this.getData()
			},

			gotoEditor() {
				uni.navigateTo({
					url: "/pages/editor/editor"
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.home {
		.item {
			padding-bottom: 5px;
			border-bottom: 1px solid #eee;
		}

		.edit {
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: #549ddd;
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			position: fixed;
			right: 30rpx;
			bottom: 250rpx;
			z-index: 99;

			span {
				color: #fff;
				font-size: 50rpx;
			}
		}
	}
</style>