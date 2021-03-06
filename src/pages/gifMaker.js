import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import {Decoder} from '../fastgif/fastgif';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Slider from '@material-ui/lab/Slider';
import Drawer from '@material-ui/core/Drawer';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import DownLoadIcon from '@material-ui/icons/CloudDownload';
import PreIcon from '@material-ui/icons/SkipPrevious';
import NextIcon from '@material-ui/icons/SkipNext';
import VisibilityIcon from '@material-ui/icons/Visibility';
import WebIcon from '@material-ui/icons/Http';
import LinearProgress from '@material-ui/core/LinearProgress';

import StopIcon from '@material-ui/icons/Stop';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Grid from '@material-ui/core/Grid';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';


import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import DeleteIcon from '@material-ui/icons/Delete';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import copy from 'copy-to-clipboard';
import axios from 'axios';
import localStorageDB from 'localstoragedb';
import {SketchPicker} from 'react-color';

const downloadFile = (outputUrl, name) => {
	let a = document.createElement("a");
	document.body.appendChild(a);
	a.style = "display: none";
	a.href = outputUrl;
	a.download = `altair_${name}`;
	a.click();
};

const styles = theme => ({
	label: {
		color: 'rgba(0, 0, 0, 0.54)',
		padding: '10px',
		fontSize: '0.8rem',
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		lineHeight: 1,
	},
	swatch: {
		padding: '5px',
		borderRadius: '1px',
		boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
		display: 'inline-block',
		cursor: 'pointer',
		width: '36px',
		height: '14px',
	},
	canvasWrapper: {
		margin: '0 auto',
	},
	upload: {
		border: 'dashed 2px #aaa',
	},
	speedDial: {
		position: 'fixed',
		bottom: theme.spacing.unit * 2,
		right: theme.spacing.unit * 3,
	},
	progress: {
		margin: theme.spacing.unit * 2,
	},
	button: {
		margin: theme.spacing.unit,
	},
	actionButton: {
		width: '64px'
	},
	input: {
		display: 'none',
	},
	textField: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		width: 200,
	},
	fontColorTextField: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		width: 180,
		display: 'inline-block'
	},
	card: {},
	media: {
		width: '100%',
	},
	wrap: {
		margin: '0 auto',
		width: 700
	},
	hide: {
		display: 'none',
	},
	show: {
		display: 'block',
	},
	root: {
		flexGrow: 1,
		position: 'relative'
	},
	flex: {
		flex: 1,
	},
	menuButton: {
		marginLeft: -12,
		marginRight: 20,
	},
	fab: {
		position: 'absolute',
		bottom: theme.spacing.unit * 2,
		right: theme.spacing.unit * 2,
	},
	fabSave: {
		position: 'absolute',
		bottom: theme.spacing.unit * 2 + 60,
		right: theme.spacing.unit * 2,
	},
	start: {
		width: 50
	},
	end: {
		width: 50
	},
	text: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
	},
	formControl: {
		margin: theme.spacing.unit,
	}
});


class Gif extends React.Component {

	handleInputChange = (e) => {

	};
	handleUrlChange = (e) => {
		this.setState({
			webImageUrl: e.target.value,
		})
	};
	handleImportTextData = () => {
		const {textTemplate} = this.state;
		let textData = [];
		try {
			textData = JSON.parse(textTemplate);
		} catch (error) {
			alert('模板解析失败')
		}
		this.setState({
			textData,
			dialogOpen: false,
			textTemplate: '',
		})
	};
	handleTextTemplateChange = (e) => {
		this.setState({
			textTemplate: e.target.value,
		})
	};
	handleDialogOpen = () => {
		this.setState({dialogOpen: true});
	};
	handleDialogClose = () => {
		this.setState({dialogOpen: false, textTemplate: '', dialogImportWebImageOpen: false, webImageUrl: ''});
	};
	init = () => {
		this.setState({
			displayColorPicker: false,
			fontColor: '#000',
			fontSize: 20,
			dialogImportWebImageOpen: false,
			textTemplate: '',
			dialogOpen: false,
			file: false,
			currentFrame: 0,
			play: true,
			context: null,
			data: [],
			delay: 80,
			isFileParseDone: false,
			textData: [],
			drawerOpen: false,
			open: false,
			hidden: false,
			gif: false,
			webImageUrl: '',
			uploadImageUrl: '',
			showProcess: false,
			uploadTemplateDone: false,
			gifx: {
				image_url: '',
				caption_template: '',
			}
		});
		window.location.replace("https://altair.gine.me/#/")
	};
	// 上传本地图片
	uploadImage = (func) => {
		const {textData, imgFile,} = this.state;
		let url;
		let tmp = JSON.stringify(textData);
		if (imgFile) {
			let formData = new FormData();
			formData.append('smfile', imgFile);

			axios.post('https://sm.ms/api/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}).then(res => {
				url = res.data.data.url;
				this.setState({
					uploadImageUrl: url,
					gifx: {
						image_url: url,
						caption_template: tmp
					}
				}, () => {
					func()
				});
			})
		}
	};
	handleActionClick = (action) => {
		if (action === 'exportText') {
			const {textData} = this.state;
			let tmp = JSON.stringify(textData);
			copy(tmp);
			alert('已成功复制字幕模板\n' + tmp);
		} else if (action === 'importWebImage') {
			this.setState({
				dialogImportWebImageOpen: true,
			})
		}
		else {
			let action_map = {
				save: this.saveToGif,
				addText: this.addText,
				removeText: this.removeText,
				preview: this.handlePreview,
				init: this.init,
				importText: this.handleDialogOpen,
				upload: this.uploadTemplate,
			};
			let func = action_map[action];
			func();
		}
	};
	handleOpen = () => {
		if (!this.state.hidden) {
			this.setState({
				open: true,
			});
		}
	};
	handleSpeedDialClose = () => {
		this.setState({
			open: false,
		});
	};
	showFrame = (num) => {
		const {context, gif, maxFrame, textData, gifInfo: {width, height}, fontSize, fontColor} = this.state;
		let thisFrame = textData.filter(item => {
			let [a, z] = item.timeDuration;
			if (num >= a && num < z) {
				return true
			} else {
				return false
			}
		});

		if (num >= 0 && num < maxFrame) {
			context.putImageData(gif[num], 0, 0)
		}

		if (thisFrame.length <= 0) {
			return;
		}
		const startPx = parseInt(width / 2, 10);
		context.font = `${fontSize}px serif`;
		context.textAlign = 'center';
		context.textBaseline = 'bottom';
		context.fillStyle = fontColor;
		context.strokeText(thisFrame[0].text, startPx, height, width);
		context.fillText(thisFrame[0].text, startPx, height, width)
	};
	moveToFrame = (num) => {
		try {
			this.showFrame(num)
		} catch (error) {
			console.error(num);
			console.error(error)
		}
		this.setState({
			currentFrame: num
		})
	};
	changeFrame = () => {
		const {gif, currentFrame, maxFrame} = this.state;

		if (gif && currentFrame < maxFrame) {
			this.setState({
				currentFrame: this.state.currentFrame + 1,
			});
			if (gif[currentFrame]) {
				this.showFrame(currentFrame)
			}
		} else if (currentFrame === maxFrame) {
			clearInterval(this.state.intervalId);
			this.setState({
				currentFrame: 0,
				play: !this.state.play
			})
		}
	};
	showFirstFrame = () => {
		const {context, gif} = this.state;
		context.putImageData(gif[0], 0, 0);
		this.setState({
			play: false,
			currentFrame: 0
		})
	};
	handleDelayChange = (event) => {
		this.setState({
			delay: event.target.value,
			play: false,
		});
		clearInterval(this.state.intervalId);
	};
	handleFontSizeChange = (event) => {
		this.setState({
			fontSize: event.target.value,
			play: false,
		});
	};
	parseImage = (imageDataList) => {
		let canvas = document.getElementById("canvas");
		let context = canvas.getContext("2d");
		let firstFrame = imageDataList[0];
		const {imageData: {width, height}} = firstFrame;
		canvas.setAttribute("width", width);
		canvas.setAttribute("height", height);

		const frameNums = imageDataList.length;
		let images = imageDataList.map(item => item.imageData);
		this.setState({
			gif: images,
			maxFrame: frameNums - 1,
			canvas,
			context,
			isFileParseDone: true,
			gifInfo: {width, height},
		});
		this.showFirstFrame()

	};
	importWebImage = () => {
		this.handleDialogClose();
		const {webImageUrl} = this.state;
		const decoder = new Decoder();
		let url;
		try {
			url = new URL(webImageUrl);
		} catch (e) {
			alert('图像链接有误');
		}
		let filename = url.pathname.split('/').pop();
		this.setState({
			file: {url: webImageUrl, name: filename},
			isFileParseDone: false,
		}, () => {
			fetch(webImageUrl).catch(() => {
				alert("图像获取失败");
			}).then((response) => response.arrayBuffer())
				.then((buffer) => decoder.decode(buffer))
				.then(imageDataList => {
					this.parseImage(imageDataList)
				}).catch(() => {
				this.init();
				alert('解析出错,请上传其它gif');
			});
		})
	};
	parseGif = () => {
		const {file} = this.state;
		let fr = new FileReader();

		fr.onload = () => {
			const decoder = new Decoder();
			decoder.decode(fr.result).then(imageDataList => {
				this.parseImage(imageDataList)
			}).catch(() => {
				this.init();
				alert('解析出错,请上传其它gif');
			});
		};

		if (file) {
			fr.readAsArrayBuffer(file)
		}

	};
	handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			this.setState({
				file,
				isFileParseDone: false,
				imgFile: file
			}, () => {
				this.parseGif()
			})
		}
	};
	handleStop = () => {
		clearInterval(this.state.intervalId);
		this.setState({play: false});
	};
	handlePlay = () => {
		let intervalId = setInterval(this.changeFrame, this.state.delay);
		this.setState({intervalId: intervalId, play: true});
	};
	onSliderChange = (e, value) => {
		const {maxFrame, gif} = this.state;
		if (maxFrame && gif && value < maxFrame) {
			this.moveToFrame(value)
		}
	};
	handleStartChange = (event, index) => {
		const start = parseInt(event.target.value);
		const {textData} = this.state;

		let newTextData = textData.slice();

		let [a, z] = newTextData[index].timeDuration;
		newTextData[index].timeDuration = [start, z];

		this.handleStop();
		this.moveToFrame(start);
		this.setState({
			textData: newTextData,
			start
		})
	};
	handleEndChange = (event, index) => {
		// fuck js
		// why event.target.value is string
		// Warning: Received NaN for the `max` attribute. If this is expected, cast the value to a string.
		const end = parseInt(event.target.value);
		const {textData} = this.state;
		let newTextData = textData.slice();
		let [a, z] = newTextData[index].timeDuration;
		newTextData[index].timeDuration = [a, end];

		this.handleStop();
		this.moveToFrame(end);
		this.setState({
			textData: newTextData,
			end
		})
	};
	handleTextChange = (event, index) => {
		const text = event.target.value;
		const {textData} = this.state;
		let newTextData = textData.slice();
		newTextData[index].text = text;

		this.handleStop();
		this.setState({
			textData: newTextData,

		})
	};
	removeText = () => {
		this.handleStop();
		const {textData} = this.state;
		textData.pop();
		this.setState({
			textData,
		})
	};
	addText = () => {
		this.handleStop();
		const {currentFrame, textData} = this.state;

		let startFrame;
		if (textData.length === 0) {
			startFrame = currentFrame
		} else if (currentFrame > textData[textData.length - 1].timeDuration[1]) {
			startFrame = currentFrame
		} else {
			startFrame = textData[textData.length - 1].timeDuration[1]
		}

		let newTextData = [...textData, {
			timeDuration: [startFrame, startFrame + 1],
			text: ''
		}];
		this.setState({
			textData: newTextData,
		})
	};
	saveToGif = () => {
		const {gifInfo: {width, height}, maxFrame, delay, file: {name}, imgFile} = this.state;
		let canvas = document.createElement('canvas');
		canvas.setAttribute("width", width);
		canvas.setAttribute("height", height);
		let context = canvas.getContext("2d");
		const {gif, textData, fontSize, fontColor} = this.state;

		// gif.js canvas 2 gif
		let gifMaker = new window.GIF({
			workers: 2,
			quality: 10,
			width,
			height,
		});

		for (let currentFrame = 0; currentFrame < maxFrame; currentFrame++) {
			let thisFrame = textData.filter(item => {
				let [a, z] = item.timeDuration;
				return currentFrame >= a && currentFrame < z;
			});

			if (currentFrame >= 0 && currentFrame < maxFrame) {
				context.putImageData(gif[currentFrame], 0, 0)
			}
			if (thisFrame.length > 0) {
				const startPx = parseInt(width / 2, 10);
				context.font = `${fontSize}px serif`;
				context.textAlign = 'center';
				context.textBaseline = 'bottom';
				context.fillStyle = fontColor;
				context.strokeText(thisFrame[0].text, startPx, height, width);
				context.fillText(thisFrame[0].text, startPx, height, width)
			}
			gifMaker.addFrame(context, {delay: delay, copy: true});

		}

		let react = this;

		gifMaker.on('progress', function (a) {
			if (a >= 1) {
				react.setState({showProcess: false})
			}
		});
		gifMaker.on('finished', function (blob) {
			downloadFile(URL.createObjectURL(blob), name);
		});
		react.setState({showProcess: true}, () => {
			gifMaker.render();
		});

		// 本地图片上传再创建本地记录
		// 网络图片直接创建本地记录
		if (imgFile) {
			this.uploadImage(this.createLocalGifxRecord);
		} else {
			this.createLocalGifxRecord();
		}
	};
	// 保存gifx到本地
	createLocalGifxRecord = () => {
		const {db, gifx, textData} = this.state;
		let now = new Date();
		let caption_template = JSON.stringify(textData);
		db.insert("gifx", {
			image_url: gifx.image_url,
			caption_template: caption_template,
			create_time: now.toISOString(),
			is_fav: false,
			is_upload: false,
		});
		db.commit();
	};
	toggleDrawer = (open) => {
		this.setState({
			drawerOpen: open
		})
	};
	handlePreview = () => {
		this.handleStop();
		this.showFirstFrame();
		this.handlePlay();
	};
	handlePreFrame = () => {
		const {currentFrame} = this.state;
		this.moveToFrame(currentFrame - 1)
	};
	handleNextFrame = () => {
		const {currentFrame} = this.state;
		this.moveToFrame(currentFrame + 1)
	};
	shouldShowCircularProgress = () => {
		const {file, isFileParseDone} = this.state;
		if (file) {
			return !isFileParseDone;
		} else {
			return false
		}
	};
	getTmp = (image_url, caption_template) => {
		this.setState({
			textTemplate: caption_template,
			webImageUrl: image_url,
			gifx: {
				image_url,
				caption_template,
			}
		}, () => {
			this.importWebImage();
			this.handleImportTextData()
		})
	};

	handleChangeComplete = (color) => {
		this.setState({fontColor: color.hex});
	};
	handleClick = () => {
		this.setState({displayColorPicker: !this.state.displayColorPicker})
	};
	handleClose = () => {
		this.setState({displayColorPicker: false})
	};

	constructor(props) {
		super(props);

		// init db
		let db = new localStorageDB("altair", localStorage);

		if (db.isNew()) {
			db.createTable("gifx", ["image_url", "caption_template", "create_time"]);
		}
		try {
			db.queryAll("gifx", {sort: [["ID", "DESC"]]});
		} catch (e) {
			console.log(e);
			db.createTable("gifx", ["image_url", "caption_template", "create_time"]);
		}

		this.state = {
			fontSize: 20,
			fontColor: '#000',
			db,
			dialogOpen: false,
			currentFrame: 0,
			play: true,
			context: null,
			data: [],
			delay: 80,
			isFileParseDone: false,
			textData: [],
			drawerOpen: false,
			open: false,
			hidden: false,
			gif: false,
			textTemplate: '',
			webImageUrl: '',
			uploadImageUrl: '',
			dialogImportWebImageOpen: false,
			showProcess: false,
			imgFile: undefined,
			uploadTemplateDone: false,
			gifx: {
				image_url: '',
				caption_template: '',
			}
		}
	}

	setStateAsync(state) {
		return new Promise((resolve) => {
			this.setState(state, resolve)
		});
	}

	componentWillUnmount() {
		if (this.state.intervalId) {
			clearInterval(this.state.intervalId);
		}
	}

	componentDidMount() {
		let sp = new URLSearchParams(this.props.location.search);
		let tmpId = sp.get('tmpId');
		let tmpFrom = sp.get('from');
		const {db} = this.state;
		if (tmpId && tmpId.length) {
			if (tmpFrom === 'myGif') {
				let record = db.queryAll("gifx", {
					query: {ID: parseInt(tmpId)}
				});
				const {image_url, caption_template} = record[0];
				this.getTmp(image_url, caption_template);

			} else if (tmpFrom === 'myFav') {
				let record = db.queryAll("fav", {
					query: {ID: parseInt(tmpId)}
				});
				const {image_url, caption_template} = record[0];
				this.getTmp(image_url, caption_template);
			}
			else {
				axios.get(`https://gine.me/gif/tmp/${tmpId}/`).then(res => {
					const {img_url, caption_template} = res.data;
					this.getTmp(img_url, caption_template);
				});
			}
		}
	}

	render() {
		const {classes} = this.props;
		const {
			hidden, open, file, dialogOpen, textTemplate, currentFrame, maxFrame, gif, play,
			textData, webImageUrl, dialogImportWebImageOpen, isFileParseDone, showProcess, fontSize, fontColor, displayColorPicker
		} = this.state;

		let actions = [{icon: <WebIcon/>, name: '导入网络图片', action: 'importWebImage'},];

		if (isFileParseDone) {
			actions = actions.concat([
				{icon: <DownLoadIcon/>, name: '保存', action: 'save'},
				{icon: <VisibilityIcon/>, name: '预览', action: 'preview'},
				// {icon: <ContentCopyIcon/>, name: '复制字幕模板', action: 'exportText'},
				// {icon: <InputIcon/>, name: '导入字幕模板', action: 'importText'},
				{icon: <DeleteIcon/>, name: '重置', action: 'init'},
				{icon: <RemoveIcon/>, name: '删除字幕', action: 'removeText'},
				{icon: <AddIcon/>, name: '添加字幕', action: 'addText'},
			])
		}

		const _shouldShowCircularProgress = this.shouldShowCircularProgress();
		return (
			<div>
				<Grid container>
					<Grid item xs={12} sm={12} md={3}/>
					<Grid item xs={12} sm={12} md={6}>
						<div className={classes.root}>
							{
								showProcess && <LinearProgress color="primary"/>
							}
							{
								_shouldShowCircularProgress && <LinearProgress color="primary"/>
							}
						</div>
						<Card>
							<div className={file ? classes.canvasWrapper : classes.upload}>
								<input
									onChange={this.handleFileChange}
									accept="image/gif"
									className={classes.input}
									id="raised-button-file"
									multiple
									type="file"
								/>
								{
									file ? <canvas id="canvas" className={classes.media}>
										</canvas>
										: <label htmlFor="raised-button-file">
											<canvas id="canvas" className={classes.media}>
											</canvas>
										</label>
								}

							</div>
							{
								gif &&
								<div style={{textAlign: 'center'}}>
									<Grid container spacing={24}>
										<Grid item xs={12} sm={12} md>
											<div style={{margin: '0 auto'}}>
												<ToggleButtonGroup>
													<ToggleButton onClick={this.handlePreFrame} value='pre'
													              className={classes.actionButton}>
														<PreIcon/>
													</ToggleButton>
													{
														play ?
															<ToggleButton onClick={this.handleStop} value='stop'
															              className={classes.actionButton}>
																<StopIcon/>
															</ToggleButton> :
															<ToggleButton onClick={this.handlePlay} value='play'
															              className={classes.actionButton}>
																<PlayArrowIcon/>
															</ToggleButton>
													}
													<ToggleButton onClick={this.handleNextFrame} value='next'
													              className={classes.actionButton}>
														<NextIcon/>
													</ToggleButton>
												</ToggleButtonGroup>
											</div>
										</Grid>
									</Grid>

									<Slider value={currentFrame}
									        min={0}
									        max={maxFrame}
									        step={1}
									        onChange={this.onSliderChange}
									        style={{marginLeft: '-5px'}}
									/>
								</div>
							}

						</Card>
						<div style={{padding: 20}}>
							{
								textData.map((data, index) => {
									let [a, z] = data.timeDuration;
									a = parseInt(a);
									z = parseInt(z);
									let text = data.text;
									let startInputProps = {
										min: 0,
										max: maxFrame - 1
									};
									let endInputProps = {
										min: 0,
										max: maxFrame - 1
									};

									return <Grid container spacing={16} key={`text-${index}`}>
										<Grid item xs={1} sm={1} md={1}>
                                        <span style={{
	                                        fontSize: '2em',
	                                        fontWeight: 500
                                        }}>
                                            {
	                                            index
                                            }
                                        </span>
										</Grid>
										<Grid item xs={2} sm={2} md={2}>
											<TextField
												autoFocus
												className={classes.start}
												margin="dense"
												id={`text-data-${index}-start`}
												label="开始"
												type="number"
												inputProps={startInputProps}
												value={a}
												max={maxFrame}
												onChange={(e) => this.handleStartChange(e, index)}
											/>
										</Grid>
										<Grid item xs={2} sm={2} md={2}>
											<TextField
												autoFocus
												className={classes.end}
												margin="dense"
												id={`text-data-${index}-end`}
												label="结束"
												value={z}
												inputProps={endInputProps}
												type="number"
												max={maxFrame}
												onChange={(e) => this.handleEndChange(e, index)}
											/>
										</Grid>
										<Grid item xs={6} sm={6} md={6}>
											<TextField
												autoFocus
												fullWidth
												margin="dense"
												className={classes.text}
												id={`text-data-${index}-text`}
												label="字幕"
												value={text}
												type="text"
												onChange={(e) => {
													this.handleTextChange(e, index)
												}}
											/>
										</Grid>
									</Grid>
								})
							}

						</div>
					</Grid>
					<Grid item xs={12} sm={12} md={3}>
						<div style={{padding: ' 0 2em'}}>
							<TextField
								id="frame"
								label="当前帧"
								className={classes.textField}
								value={this.state.currentFrame}
								type="number"
								margin="normal"
								disabled={true}
							/>
							<TextField
								id="delay"
								label="延迟(ms)"
								className={classes.textField}
								value={this.state.delay}
								onChange={this.handleDelayChange}
								type="number"
								margin="normal"
							/>
							<TextField
								id="fontSize"
								label="字体大小(px)"
								className={classes.textField}
								value={fontSize}
								onChange={this.handleFontSizeChange}
								type="number"
								margin="normal"
							/>
							<div style={{width: 200}}>
								<label htmlFor="color-picker" className={classes.label}>字体颜色</label>
								<div id="color-picker">
									<ClickAwayListener onClickAway={this.handleClose}>
									<div style={{background: fontColor, width: '200px', height: '20px',marginLeft:'10px'}}
									     onClick={this.handleClick}>
									</div>
									{
										displayColorPicker && <SketchPicker
											color={this.state.fontColor}
											onClick={this.handleClose}
											onChangeComplete={this.handleChangeComplete}
										/>
									}
									</ClickAwayListener>
								</div>

							</div>
						</div>
					</Grid>
					<Grid item xs={12} sm={12} md/>
					<SpeedDial
						ariaLabel="SpeedDial example"
						className={classes.speedDial}
						hidden={hidden}
						icon={<SpeedDialIcon/>}
						// onBlur={this.handleClose}
						onClick={open ? this.handleSpeedDialClose : this.handleOpen}
						// onClose={this.handleClose}
						// onFocus={isTouch ? undefined : this.handleOpen}
						// onMouseEnter={isTouch ? undefined : this.handleOpen}
						// onMouseLeave={this.handleClose}
						open={open}
					>
						{actions.map(action => (
							<SpeedDialAction
								key={action.name}
								icon={action.icon}
								tooltipTitle={action.name}
								tooltipOpen
								onClick={() => this.handleActionClick(action.action)}
							/>
						))}
					</SpeedDial>
					<Drawer open={this.state.drawerOpen} onClose={() => this.toggleDrawer(false)}>
						<div
							tabIndex={0}
							role="button"
							onClick={() => this.toggleDrawer(false)}
							onKeyDown={() => this.toggleDrawer(false)}
						>
						</div>
					</Drawer>

					<Dialog
						open={dialogOpen}
						onClose={this.handleDialogClose}
						aria-labelledby="form-dialog-title"
					>
						<DialogTitle id="form-dialog-title">导入字幕模板</DialogTitle>
						<DialogContent>
							<TextField
								style={{width: 500}}
								autoFocus
								margin="dense"
								id="textTmp"
								label="字幕模板"
								type="text"
								value={textTemplate}
								onChange={this.handleTextTemplateChange}
								fullWidth
							/>
						</DialogContent>
						<DialogActions>
							<Button onClick={this.handleDialogClose} color="primary">
								取消
							</Button>
							<Button onClick={this.handleImportTextData} color="primary">
								导入
							</Button>
						</DialogActions>
					</Dialog>


					<Dialog
						open={dialogImportWebImageOpen}
						onClose={this.handleDialogClose}
						aria-labelledby="form-dialog-title"
					>
						<DialogTitle id="form-dialog-title">导入网络图片</DialogTitle>
						<DialogContent>
							<TextField
								style={{width: 500}}
								autoFocus
								margin="dense"
								id="webImageUrl"
								label="图片URL"
								type="text"
								value={webImageUrl}
								onChange={this.handleUrlChange}
							/>
						</DialogContent>
						<DialogActions>
							<Button onClick={this.handleDialogClose} color="primary">
								取消
							</Button>
							<Button onClick={this.importWebImage} disabled={_shouldShowCircularProgress}>确定</Button>
						</DialogActions>
					</Dialog>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(Gif);
