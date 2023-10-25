<template>
	<view class="detail">
		<view v-if="isLoading">
			<u-loading-page :loading="true"></u-loading-page>
		</view>
		<view v-else>
			<view class="container">
				<view class="title">
					{{articleObj.title}}
				</view>
				<view class="userinfo">
					<u-avatar :src="getAvatar(articleObj)" shape="circle" size="80"></u-avatar>
					<view class="info">
						<view class="name">{{getName(articleObj)}}</view>
						<view class="addr">
							<uni-dateformat :date="articleObj.publish_date" format="yyyy/MM/dd hh:mm:ss"
								:threshold="[60000,3600000*24*7]" />
							-发布于{{articleObj.province}}
						</view>
					</view>
				</view>
				<view class="content">
					<u-parse :content="articleObj.content" :tagStyle="style"></u-parse>
				</view>
				<view class="like">
					<view class="hand" :class="!isLike?'active':''" @click="handleLike">
						<text class="iconfont icon-dianzan"></text>
						<text class="count" v-if="articleObj.like_count">{{articleObj.like_count}}</text>
					</view>
					<view class="users">
						<template v-for="item in likeUser">
							<u-avatar :src="getAvatar(item)" shape="circle" size="56"></u-avatar>
						</template>
					</view>
					<view class="view-count">
						<text class="num">{{articleObj.view_count}}</text>人看过
					</view>
				</view>
			</view>
		</view>
		<u-empty mode="comment" icon="https://cdn.uviewui.com/uview/empty/comment.png" width="300" textSize="30"
			v-if="!commentList.length && noComment">
		</u-empty>
		<view class="comment" v-else>
			<view class="item-panel">
				<template v-for="item in commentList">
					<commentItem :item="item" @delCallback="delCallback" :isreplyPage="false"></commentItem>
				</template>
				<u-loadmore :status="status" fontSize="24" iconSize="30" />
			</view>

		</view>
		<commentInput :commentObj="commentObj" @commentCallback="commentCallback"></commentInput>
	</view>
</template>

<script>
	const db = uniCloud.database()
	const utilsObj = uniCloud.importObject("utilsObj", {
		customUI: true
	})
	import {
		getAvatar,
		getName
	} from "@/utils/index.js"
	import {
		store,
	} from '@/uni_modules/uni-id-pages/common/store.js'
	export default {
		data() {
			return {
				isLoading: true,
				articleId: "",
				articleObj: null,
				style: {
					p: 'line-height: 1.7em',
				},
				isLike: false,
				likeUser: [],
				// 回复框相关
				commentObj: {
					article_id: "",
					comment_type: 0
				},
				// 评论列表
				commentList: [],
				noComment: false,
				status: 'loadmore'
			};
		},
		onLoad(e) {
			if (!e.id) {
				this.errFun()
				return
			}
			this.articleId = e.id
			this.commentObj.article_id = e.id
			this.getData()
			this.updateView()
			this.getLikeUser()
		},
		onReachBottom() {
			if (this.status == 'nomore') {
				return
			}
			this.status = 'loading'
			this.getCommentList()
		},
		methods: {
			getAvatar,
			getName,
			// 多少人查看了文章
			async getLikeUser() {
				let likeTemp = await db.collection('talk-like').where(`article_id=='${this.articleId}'`).getTemp()
				let userTemp = await db.collection('uni-id-users').field("_id,avatar_file").getTemp()
				db.collection(likeTemp, userTemp).orderBy('like_date desc').limit(5).get().then(res => {
					res.result.data = res.result.data.reverse()
					this.likeUser = res.result.data
				})
			},
			errFun() {
				uni.showToast({
					title: "参数错误",
					icon: "none"
				})
				setTimeout(() => {
					uni.reLaunch({
						url: "/pages/index/index"
					})
				}, 1000)
			},
			// 获取评论列表
			async getCommentList() {
				let comTemp = await db.collection('talk-comment').where(
					`article_id=='${this.articleId}'&&comment_type==0`).getTemp()
				let userTemp = await db.collection('uni-id-users').field("_id,username,avatar_file").getTemp()
				let res = await db.collection(comTemp, userTemp).orderBy("comment_date desc").skip(this.commentList
						.length).limit(10)
					.get()

				// 获取所有评论的ID,然后统计一级评论下面有多少二级评论
				let comId = res.result.data.map(item => {
					return item._id
				})
				// 按照回复ID分组,统计每个一级评论下面有多少个二级评论
				let comRes = await db.collection("talk-comment").where({
					reply_comment_id: db.command.in(comId)
				}).groupBy("reply_comment_id").groupField('count(*) as replyCount').get()
				console.log(comRes);
				// 找到对应的一级评论,添加一个属性表示二级评论数
				res.result.data.forEach(item => {
					let index = comRes.result.data.findIndex(e => {
						return item._id == e.reply_comment_id
					})
					if (index >= 0) {
						item.replyCount = comRes.result.data[index].replyCount
					}
				})

				if (res.result.data.length == 0) {
					this.noComment = true
				}
				// 下拉加载更多
				if (res.result.data.length < 10) {
					this.status = 'nomore'
				}
				this.commentList = [...this.commentList, ...res.result.data]
			},

			// 获取文章详情
			getData() {
				let article = db.collection('talk-article').where(`_id=='${this.articleId}'`).getTemp()
				let user = db.collection('uni-id-users').field("_id,username,avatar_file").getTemp()
				let like = db.collection('talk-like').where(`article_id=='${this.articleId}'&&user_id==$cloudEnv_uid`)
					.getTemp()
				let tableArr = [article, user]
				if (store.hasLogin) tableArr.push(like)
				db.collection(...tableArr).get({
					getOne: true
				}).then(res => {
					this.getCommentList()
					// console.log(res);
					if (!res.result.data) {
						this.errFun()
						return
					}
					this.articleObj = res.result.data
					this.isLoading = false
					uni.setNavigationBarTitle({
						title: this.articleObj.title
					})
					// 当前用户是否点赞了
					let bool = false
					if (store.hasLogin) {
						// 是否登录
						bool = res.result.data._id['talk-like'].length ? true : false
					}
					this.isLike = bool
				}).catch(err => {
					console.log(err);
					uni.showToast({
						title: "请登录后重试",
						icon: "none"
					})
					setTimeout(() => {
						uni.reLaunch({
							url: "/pages/index/index"
						})
					}, 1000)
				})
			},
			// 评论回调
			commentCallback(comData) {
				this.commentList.unshift({
					...comData,
					...this.commentObj,
					user_id: [store.userInfo]
				})

			},
			// 删除评论回调，在父组件删除
			delCallback(e) {
				let index = this.commentList.findIndex(item => {
					return item._id == e.id
				})
				this.commentList.splice(index, 1)

			},
			// 点赞处理
			async handleLike() {
				// 没有登录不能点赞
				if (!store.hasLogin) {
					uni.showToast({
						title: "请登录",
						icon: "none",
						mask: true
					})
					setTimeout(() => {
						uni.navigateTo({
							url: "/uni_modules/uni-id-pages/pages/login/login-withpwd"
						})
					}, 1000)
					return
				}

				let time = Date.now()
				// 防止恶意点击发送多次请求
				if (time - this.likeTime < 2000) {
					uni.showToast({
						title: "操作频繁，请稍后···",
						icon: "none"
					})
					return
				}
				this.likeTime = time
				this.isLike ? this.articleObj.like_count-- : this.articleObj.like_count++
				this.isLike = !this.isLike
				// 发送请求
				let count = await db.collection('talk-like').where(
					`article_id=='${this.articleId}'&&user_id==$cloudEnv_uid`).count()
				if (!count.result.total) {
					// 添加
					db.collection('talk-like').add({
						article_id: this.articleId
					}).then(res => {
						utilsObj.updateFun("talk-article", "like_count", this.articleId, 1)
					})
				} else {
					// 删除
					db.collection('talk-like').where(`article_id=='${this.articleId}'&&user_id==$cloudEnv_uid`)
						.remove()
					utilsObj.updateFun("talk-article", "like_count", this.articleId, -1)
				}

			},
			// 更新阅读量
			updateView() {
				utilsObj.updateFun("talk-article", "view_count", this.articleId, 1)
			}
		}
	}
</script>

<style lang="scss">
	.detail {
		background-color: #f8f8f8;
		min-height: calc(100vh - var(--window-top));
		width: 100%;

		.container {
			background-color: #fff;
			padding: 30rpx;

			.title {
				font-size: 40rpx;
				font-weight: bold;
				color: #333;
			}

			.userinfo {
				display: flex;
				align-items: center;
				margin: 20rpx 0;

				.info {
					margin-left: 24rpx;

					.name {
						font-size: 30rpx;
					}

					.addr {
						font-size: 26rpx;
						color: #999;
					}
				}
			}

			.content {
				font-size: 28rpx;
				color: #555;
			}

			.like {
				width: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				flex-direction: column;
				margin-top: 20rpx;

				.users {
					display: flex;

					.u-avatar {
						margin-left: -14rpx;
					}
				}

				.hand {
					display: flex;
					justify-content: center;
					align-items: center;
					flex-direction: column;
					border-radius: 50rpx;
					width: 150rpx;
					height: 100rpx;
					background-color: #4edd76;

					.iconfont {
						font-size: 34rpx;
					}

					.count {
						font-size: 24rpx;
					}

					&.active {
						background-color: #eaeaea;
					}
				}

				.users {
					padding: 10rpx 0;
				}

				.view-count {
					font-size: 26rpx;
					color: #555;

					.num {
						color: #00aaff;
					}
				}
			}
		}

		.comment {
			.item-panel {
				padding: 30rpx;
				padding-bottom: 130rpx;
			}
		}
	}
</style>