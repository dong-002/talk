<template>
	<view class="edit-body">
		<view class="title">
			<input type="text" v-model="articleObj.title" placeholder="请输入标题" placeholder-class="title-input">
		</view>
		<view class="content">
			<editor placeholder="请编写内容" id="editor" show-img-size show-img-toolbar show-img-resize @ready="editReady"
				@focus="onFocus" @statuschange="onStatuschange"></editor>
		</view>
		<button type="primary" :disabled="!articleObj.title.length" @click="submit">发布</button>
		<view class="tools" v-if="showTools">
			<text class="iconfont icon-zitibiaoti" @click="clickHead" :class="[headShow?'active':'']"></text>
			<text class="iconfont icon-zitijiacu" @click="clickBold" :class="[boldShow?'active':'']"></text>
			<text class="iconfont icon-zitixieti" @click="clickItalic" :class="[italicShow?'active':'']"></text>
			<text class="iconfont icon-fengexian" @click="addDivider"></text>
			<text class="iconfont icon-charutupian" @click="insertImage"></text>
			<text class="iconfont icon-duigoux" @click="showTools=false"></text>
		</view>
	</view>
</template>

<script>
	import {
		getImgUrl,
		getProvince
	} from "@/utils/index.js"
	const db = uniCloud.database()
	export default {
		data() {
			return {
				showTools: false,
				headShow: false,
				boldShow: false,
				italicShow: false,
				articleObj: {
					title: "",
					content: "",
					desc: "",
					picUrl: ""
				},
				editId: ""
			};
		},
		onLoad(e) {
			if (e?.id) {
				this.getInfo(e.id)
				this.editId = e.id
			}
			this.getP()
		},
		methods: {
			async getInfo(id) {
				await db.collection('talk-article').doc(id).get({
					getOne: true
				}).then(res => {
					this.articleObj = res.result.data
					this.editReady(res.result.data)
				})
			},
			async getP() {
				let res = await getProvince()
				this.articleObj.province = res
			},
			onFocus() {
				this.showTools = true
			},
			editReady(data) {
				uni.createSelectorQuery().in(this).select('#editor').fields({
						size: true,
						context: true
					},
					res => {
						this.editorCtx = res.context
						if (data) {
							res.context.setContents({
								html: data.content
							})
						}
					}).exec()
			},
			checkStatus(name, detail, obj) {
				if (detail.hasOwnProperty(name)) {
					this[obj] = true;
				} else {
					this[obj] = false;
				}
			},
			// 当样式发生改变的时候
			onStatuschange(e) {
				let detail = e.detail
				console.log(detail);
				this.checkStatus("header", detail, "headShow");
				this.checkStatus("bold", detail, "boldShow");
				this.checkStatus("italic", detail, "italicShow");
			},
			// 分隔线
			addDivider() {
				this.editorCtx.insertDivider()
			},
			// 标题
			clickHead() {
				this.headShow = !this.headShow
				this.editorCtx.format("header", this.headShow ? "H2" : false)
			},
			// 加粗
			clickBold() {
				this.boldShow = !this.boldShow
				this.editorCtx.format("bold")
			},
			// 倾斜
			clickItalic() {
				this.italicShow = !this.italicShow
				this.editorCtx.format("italic")
			},
			// 插入图片
			insertImage() {
				uni.chooseImage({
					success: async res => {
						uni.showLoading({
							title: "加载中···",
							mask: true
						})

						for (let item of res.tempFiles) {
							let suffix = item.path.substring(item.path.lastIndexOf("."));
							let randomName = Date.now() + "" + String(Math.random()).substr(3, 6) + suffix
							let res = await uniCloud.uploadFile({
								filePath: item.path,
								cloudPath: item.name || randomName,
							})
							this.editorCtx.insertImage({
								src: res.fileID
							})
						}
						uni.hideLoading()
					}
				})
			},
			submit() {
				this.editorCtx.getContents({
					success: res => {
						this.articleObj.content = res.html
						this.articleObj.desc = res.text.slice(0, 100)
						// 获取前三个图片地址
						this.articleObj.picUrl = getImgUrl(res.html)
						uni.showLoading({
							mask: true
						})
						if (!this.editId) {
							// 新增
							db.collection("talk-article").add({
								...this.articleObj
							}).then(res => {
								uni.hideLoading()
								uni.showToast({
									title: "发布成功",
									icon: "none"
								})
								setTimeout(() => {
									uni.reLaunch({
										url: "/pages/index/index"
									})
								}, 800)
							})
						} else {
							// 修改
							db.collection("talk-article").doc(this.editId).update({
								desc: this.articleObj.desc,
								content: this.articleObj.content,
								picUrl: this.articleObj.picUrl,
								title: this.articleObj.title
							}).then(res => {
								uni.hideLoading()
								uni.showToast({
									title: "发布成功",
									icon: "none"
								})
								setTimeout(() => {
									uni.reLaunch({
										url: "/pages/index/index"
									})
								}, 800)
							})
						}


					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.edit-body {
		padding: 30rpx;

		.title {
			border-bottom: 1px solid #ddd;


			input {
				font-size: 46rpx;
				height: 80rpx;
			}

			.title-input {
				font-size: 46rpx;
				color: #bbb;
				height: 80%;
			}
		}

		.content {
			height: calc(100vh - 500rpx);
			width: 100%;
			margin-bottom: 30rpx;
			border-bottom: 1px solid #ddd;
			overflow: auto;

			.ql-container {
				height: 100%;
				overflow: auto;

				/deep/.ql-blank {
					&:before {
						font-size: 34rpx;
						color: #bbb;
						text-decoration: none;
					}
				}
			}
		}

		.tools {
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: space-around;
			position: fixed;
			bottom: 100rpx;
			left: 0;

			.iconfont {
				font-size: 36rpx;
				color: #333;

				&.active {
					color: #0199FE
				}
			}
		}
	}
</style>