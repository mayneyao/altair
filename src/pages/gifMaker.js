import React from 'react';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import TextField from '@material-ui/core/TextField';
import {GifWriter} from 'omggif'

import GifWorker from '../lib/jsgif/GifWorker';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import AddIcon from '@material-ui/icons/Add';
import DownLoadIcon from '@material-ui/icons/FileDownload';
import SaveIcon from '@material-ui/icons/Save';
import PreIcon from '@material-ui/icons/SkipPrevious';
import NextIcon from '@material-ui/icons/SkipNext';
import VisibilityIcon from '@material-ui/icons/Visibility';
import BuildIcon from '@material-ui/icons/Build';
import CircularProgress from '@material-ui/core/CircularProgress';

import LinearProgress from '@material-ui/core/LinearProgress';
import axios from 'axios';

import StopIcon from '@material-ui/icons/Stop';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';

const GifReader = (require('omggif')).GifReader;

const styles = theme => ({
    progress: {
        margin: theme.spacing.unit * 2,
    },
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
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
        width: 300,
    }
});

const frameMix = (fA, fZ) => {
    for (let i = 0; i < fA.length; i += 4) {
        if (fA[i] == 0 && fA[i + 1] == 0 && fA[i + 2] == 0 && fA[i + 3] == 0) {
            continue;
        } else {
            fZ[i] = fA[i]
            fZ[i + 1] = fA[i + 1]
            fZ[i + 2] = fA[i + 2]
            fZ[i + 3] = fA[i + 3]
        }
    }
    return fZ
};

class Gif extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            currentFrame: 0,
            play: true,
            context: null,
            data: [],
            speed: 80,
            isFileParseDone: false,
            textData: [],
            drawerOpen: false,
            previewOpen: false,
            genGifDone: false,
        }
    }


    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    showFrame = (num) => {
        const {context, gif, currentFrame, maxFrame, textData, gifInfo: {width, height}} = this.state
        let thisFrame = textData.filter(item => {
            let [a, z] = item.timeDuration
            if (num >= a && num < z) {
                return true
            } else {
                return false
            }
        });

        if (num >= 0 && num < maxFrame) {
            context.putImageData(gif[num], 0, 0)
        }

        if (thisFrame.length > 0) {
            const startPx = parseInt(width / 2)
            context.font = '20px serif';
            context.textAlign = 'center';
            context.textBaseline = 'bottom';
            context.fillStyle = "#fff";
            context.strokeText(thisFrame[0].text, startPx, height, width)
            context.fillText(thisFrame[0].text, startPx, height, width)

        }
    }

    showProcess = (context, width, height, process) => {
        const startPx = parseInt(width / 2)
        const startPy = parseInt(height / 2)
        const text = `${process}%`
        console.log(text, startPx, startPy)
        context.font = '40px serif';
        context.fillText(text, 0, 0, width)
        this.setState({
            process
        })
    }

    moveToFrame = (num) => {
        try {
            this.showFrame(num)
        } catch (error) {
            console.error(num)
            console.error(error)
        }
        this.setState({
            currentFrame: num
        })
    }

    changeFrame = () => {
        const {context} = this.state
        const {
            gif, currentFrame, maxFrame, textData
            , gifInfo: {width, height}
        } = this.state

        if (gif && currentFrame < maxFrame) {
            this.setState({
                currentFrame: this.state.currentFrame + 1,
            })
            if (gif[currentFrame]) {
                this.showFrame(currentFrame)
            }
        } else if (currentFrame == maxFrame) {
            clearInterval(this.state.intervalId);
            this.setState({
                currentFrame: 0,
                play: !this.state.play
            })
        }
    }
    showFirstFrame = () => {
        const {context, gif} = this.state
        context.putImageData(gif[0], 0, 0)
        this.setState({
            play: false,
            currentFrame: 0
        })
    }

    handleSpeedChange = (event) => {
        this.setState({
            speed: event.target.value,
            play: false,
        })
        clearInterval(this.state.intervalId);
    }

    parseGif = () => {
        const {file} = this.state
        let canvas = document.getElementById("canvas")
        let context = canvas.getContext("2d")
        let fr = new FileReader()

        fr.onload = () => {
            let gif = new GifReader(new Uint8Array(fr.result))
            const {width, height} = gif
            canvas.setAttribute("width", width)
            canvas.setAttribute("height", height)

            let allFrames = []
            const frameNums = gif.numFrames()

            for (let i = 0; i < frameNums; i++) {
                let image = context.createImageData(width, height)
                gif.decodeAndBlitFrameRGBA(i, image.data);
                let frame = gif.frameInfo(i)
                Object.assign(frame, image)

                allFrames.push(frame)
            }

            let parseFrames = [allFrames[0]]
            let images = []

            allFrames.map((eachFrame, index) => {
                if (index < frameNums && index > 0) {
                    if (eachFrame.disposal == 1) {
                        eachFrame.data = frameMix(eachFrame.data, parseFrames[index - 1].data)
                    } else if (eachFrame.disposal == 3) {
                        console.log(index)
                        eachFrame.data = parseFrames[index - 1].data
                    }
                    parseFrames.push(eachFrame);

                    let process = (index / frameNums * 100).toFixed()
                    let image = context.createImageData(gif.width, gif.height)
                    eachFrame.data.map((i, index) => {
                        image.data[index] = i
                    })
                    images.push(image)
                }
            })
            console.log(gif)
            this.setState({
                gif: images,
                maxFrame: frameNums - 1,
                canvas,
                context,
                isFileParseDone: true,
                gifInfo: {
                    width: gif.width,
                    height: gif.height
                },
                gifAllInfo: gif
            })
            this.showFirstFrame()
        }

        if (file) {
            fr.readAsArrayBuffer(file)
        }

    }

    handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            this.setState({
                file,
                isFileParseDone: false,
            }, () => {
                this.parseGif()
            })
        }
    };

    handleStop = () => {
        clearInterval(this.state.intervalId);
        this.setState({play: false});
    }

    handlePlay = () => {
        var intervalId = setInterval(this.changeFrame, this.state.speed);
        this.setState({intervalId: intervalId, play: true});
    }

    onSliderChange = (value) => {
        const {maxFrame, gif} = this.state
        if (maxFrame && gif && value < maxFrame) {
            this.moveToFrame(value)
        }
    }

    handleStartChange = (event, index) => {
        const start = event.target.value
        const {textData} = this.state

        let newTextData = textData.slice()

        let [a, z] = newTextData[index].timeDuration
        newTextData[index].timeDuration = [start, z]

        this.handleStop()
        this.moveToFrame(start)
        this.setState({
            textData: newTextData,
            start
        })
    }

    handleEndChange = (event, index) => {
        const end = event.target.value
        const {textData} = this.state

        let newTextData = textData.slice()

        let [a, z] = newTextData[index].timeDuration
        newTextData[index].timeDuration = [a, end]

        this.handleStop()
        this.moveToFrame(end)
        this.setState({
            textData: newTextData,
            end
        })
    }

    handleTextChange = (event, index) => {
        const text = event.target.value
        const {textData} = this.state
        let newTextData = textData.slice()
        newTextData[index].text = text

        this.handleStop()
        this.setState({
            textData: newTextData,

        })
    }

    addText = () => {
        this.handleStop()
        const {currentFrame, textData} = this.state

        let startFrame;
        if (textData.length === 0) {
            startFrame = currentFrame
        } else if (currentFrame > textData[textData.length - 1].timeDuration[1]) {
            startFrame = currentFrame
        } else {
            startFrame = textData[textData.length - 1].timeDuration[1]
        }

        let newTextData = [...textData, {
            timeDuration: [startFrame, undefined],
            text: ''
        }]
        this.setState({
            textData: newTextData,
            outputUrl: false,
            perview: false
        })
    }

    makeGif = () => {
        let data = new FormData()
        const {textData, file} = this.state
        data.append('text', JSON.stringify(textData))
        data.append('file', file)
        axios.post('/make_gif/', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            this.setState({
                outputUrl: res.data.file,
            })
        })
    }

    saveToGif = () => {
        const {gifInfo: {width, height}, maxFrame, speed} = this.state


        let canvas = document.createElement('canvas');
        let context = canvas.getContext("2d")
        const {gif, textData} = this.state


        let data = {speed, maxFrame, textData, gif, width, height, document}

        let GifWorker = new Worker(GifWorker);

        GifWorker.onmessage = (m) => {
            console.log("msg from worker: ", m.data);
        };
        GifWorker.postMessage(data);


        // let encoder = new GIFEncoder();
        // encoder.setRepeat(0); //auto-loop
        // encoder.setDelay(speed);
        // console.log(encoder.start())
        //
        // for (let currentFrame = 0; currentFrame < maxFrame; currentFrame++) {
        //     let thisFrame = textData.filter(item => {
        //         let [a, z] = item.timeDuration
        //         if (currentFrame >= a && currentFrame < z) {
        //             return true
        //         } else {
        //             return false
        //         }
        //     });
        //
        //     if (currentFrame >= 0 && currentFrame < maxFrame) {
        //         context.putImageData(gif[currentFrame], 0, 0)
        //     }
        //     if (thisFrame.length > 0) {
        //         const startPx = parseInt(width / 2)
        //         context.font = '20px serif';
        //         context.textAlign = 'center';
        //         context.textBaseline = 'bottom';
        //         context.fillStyle = "#fff";
        //         context.strokeText(thisFrame[0].text, startPx, height, width)
        //         context.fillText(thisFrame[0].text, startPx, height, width)
        //
        //     }
        //     encoder.addFrame(context)
        //     console.log(currentFrame)
        // }
        //
        // encoder.finish()
        // let gifUrl = 'data:image/gif;base64,' + encode64(encoder.stream().getData())
        //
        // fetch(gifUrl).then(res => res.blob()).then(blob => {
        //         this.setState({
        //             outputUrl: URL.createObjectURL(blob),
        //             genGifDone: true,
        //         })
        //     }
        // )
    }


    toggleDrawer = (open) => {
        this.setState({
            drawerOpen: open
        })
    }

    handlePreviewOpen = () => {
        this.handleStop()
        this.showFirstFrame()
        this.handlePlay()
        this.setState({
            perview: true
        })
    }

    handlePreviewClose = () => {
        this.handleStop()
        this.setState({
            perview: false
        })
    }


    handleClose = () => {
        this.setState({
            previewOpen: false
        })
    }
    handleSave = () => {
        this.downloadFile()
        this.setState({
            previewOpen: false
        })
    }
    handlePreFrame = () => {
        const {currentFrame} = this.state
        this.moveToFrame(currentFrame - 1)
    }

    handleNextFrame = () => {
        const {currentFrame} = this.state
        this.moveToFrame(currentFrame + 1)
    }

    downloadFile = () => {
        const {outputUrl} = this.state
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = outputUrl;
        a.download = 'happy';
        a.click();
    }

    playPartOfFrames = (start, end) => {
        for (let i = start; i < end; i++) {
            this.showFrame(i)
        }
    }


    componentDidUpdate() {
        const {genGifDone, previewOpen, isFileParseDone, file} = this.state
        // if (previewOpen && !genGifDone) {
        //     this.saveToGif()
        // }
    }

    shouldShowCircularProgress = () => {
        const {file, isFileParseDone} = this.state
        if (file) {
            if (isFileParseDone) {
                return false
            } else {
                return true
            }
        } else {
            if (isFileParseDone) {
                return false
            } else {
                return false
            }
        }
    }

    componentWillUnmount() {
        // use intervalId from the state to clear the interval
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
        }
    }

    render() {
        const {classes} = this.props;
        const {currentFrame, maxFrame, gif, isFileParseDone, file, play, textData, genGifDone, newFileUrl, outputUrl, perview} = this.state
        const bl = (currentFrame / maxFrame * 100).toFixed();
        const textIndex = textData.length
        const _shouldShowCircularProgress = this.shouldShowCircularProgress();
        return (
            <Grid container spacing={16}>

                <Grid item xs={12} sm={12} md/>
                <Grid item xs={12} sm={12} md={6}>
                    <div className={classes.root}>
                        {
                            _shouldShowCircularProgress ?
                                <LinearProgress color="secondary"/> : ""
                        }
                    </div>
                    <Card>
                        <div style={{margin: '0 auto'}}>
                            <canvas id="canvas" className={classes.media}>
                            </canvas>
                        </div>
                        {
                            gif ?
                                <div style={{
                                    textAlign: 'center'
                                }}>
                                    <Grid container spacing={24}>
                                        <Grid item xs={4} sm={4} md/>
                                        <Grid item xs={4} sm={4} md>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4} sm={4} md={4}>
                                                    <IconButton onClick={this.handlePreFrame} variant="raised">
                                                        <PreIcon/>
                                                    </IconButton>
                                                </Grid>

                                                <Grid item xs={4} sm={4} md={4}>
                                                    {
                                                        play ? <IconButton onClick={this.handleStop} variant="raised">
                                                                <StopIcon/>
                                                            </IconButton> :
                                                            <IconButton onClick={this.handlePlay} variant="raised">
                                                                <PlayArrowIcon/>
                                                            </IconButton>
                                                    }
                                                </Grid>
                                                <Grid item xs={4} sm={4} md={4}>
                                                    <IconButton onClick={this.handleNextFrame} variant="raised">
                                                        <NextIcon/>
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Grid item xs={4} sm={4} md>
                                            <Grid container spacing={2}>
                                                <Grid item xs={3} sm={3} md={3}>
                                                    <IconButton onClick={this.addText}><AddIcon/></IconButton>
                                                </Grid>

                                                <Grid item xs={3} sm={3} md={3}>

                                                    <IconButton
                                                        onClick={this.handlePreviewOpen}><VisibilityIcon/></IconButton>
                                                </Grid>
                                                <Grid item xs={3} sm={3} md={3}>
                                                    <IconButton onClick={this.saveToGif} variant="raised">
                                                        <BuildIcon/>
                                                    </IconButton>
                                                </Grid>
                                                <Grid item xs={3} sm={3} md={3}>

                                                    {
                                                        outputUrl ?
                                                            <IconButton
                                                                onClick={this.downloadFile}><DownLoadIcon/></IconButton> : ''
                                                    }
                                                </Grid>
                                            </Grid>


                                        </Grid>
                                    </Grid>

                                    <Slider value={currentFrame}
                                            min={0}
                                            style={{margin: '0 auto'}}
                                            max={maxFrame}
                                            onChange={this.onSliderChange}/>
                                </div>
                                : ''
                        }

                    </Card>

                    <div>
                        <TextField
                            id="frame"
                            label="frame"
                            className={classes.textField}
                            value={this.state.currentFrame}
                            type="number"
                            margin="normal"
                            disabled={true}
                        />
                        <TextField
                            id="speed"
                            label="speed"
                            className={classes.textField}
                            value={this.state.speed}
                            onChange={this.handleSpeedChange}
                            type="number"
                            margin="normal"
                        />
                    </div>

                    <div style={{padding: 20}}>
                        {
                            textData.map((data, index) => {
                                let [a, z] = data.timeDuration;
                                let text = data.text;
                                let startInputProps = {
                                    min: 0,
                                    max: maxFrame - 1
                                }
                                let endInputProps = {
                                    min: 0,
                                    max: maxFrame - 1
                                }
                                // let min, max,startInputProps,endInputProps;
                                // if (index === 0) {
                                //     startInputProps = {
                                //         min: 0,
                                //         max: maxFrame - 1
                                //     };
                                //     endInputProps = {
                                //         min: a,
                                //         max: maxFrame - 1
                                //     };
                                //
                                // } else {
                                //     [min, max] = textData[index - 1].timeDuration
                                //     startInputProps = {
                                //         min: max+1,
                                //         max: maxFrame - 1
                                //     };
                                //     endInputProps = {
                                //         min: a,
                                //         max: maxFrame - 1
                                //     };
                                // }


                                return <Grid container spacing={12}>
                                    <Grid item xs={1} sm={1} md={1}>
                                        <span style={{
                                            fontSize: '2em',
                                            fontweight: 500
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
                                            onChange={(e) => {
                                                this.handleEndChange(e, index)
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={6}>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            id={`text-data-${index}-text`}
                                            label="字幕"
                                            value={text}
                                            type="text"
                                            onChange={(e) => {
                                                this.handleTextChange(e, index)
                                            }}
                                        />
                                    </Grid>
                                    {/*<Grid item xs={1} sm={1} md={1}>*/}
                                    {/*<IconButton onClick={() => {*/}
                                    {/*this.playPartOfFrames(a, z)*/}
                                    {/*}}><VisibilityIcon/></IconButton>*/}
                                    {/*</Grid>*/}
                                </Grid>
                            })
                        }
                        <div>
                            <Button variant="fab" className={classes.fab} component="span" color='primary'>
                                <AddIcon/>
                            </Button>
                        </div>

                    </div>

                    <Dialog
                        open={this.state.previewOpen}
                        onClose={this.handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >

                        {
                            genGifDone ? <div>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-description">
                                        <img src={newFileUrl} style={{
                                            width: '100%'
                                        }}/>
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={this.handleClose} color="primary">
                                        取消
                                    </Button>
                                    <Button onClick={this.handleSave} color="primary" autoFocus>
                                        <SaveIcon/>保存
                                    </Button>
                                </DialogActions>
                            </div> : <CircularProgress className={classes.progress} color="secondary"/>
                        }


                    </Dialog>
                </Grid>
                <Grid item xs={12} sm={12} md/>
                <div>
                    <div>
                        <input
                            onChange={this.handleFileChange}
                            accept="image/gif"
                            className={classes.input}
                            id="raised-button-file"
                            multiple
                            type="file"
                        />
                        <label htmlFor="raised-button-file">
                            <Button variant="fab" className={classes.fab} component="span" color='primary'>
                                <AddIcon/>
                            </Button>

                        </label>
                    </div>

                </div>
                <Drawer open={this.state.drawerOpen} onClose={() => this.toggleDrawer(false)}>
                    <div
                        tabIndex={0}
                        role="button"
                        onClick={() => this.toggleDrawer(false)}
                        onKeyDown={() => this.toggleDrawer(false)}
                    >
                    </div>
                </Drawer>
            </Grid>
        );
    }
}


// withStyles(styles)(ButtonAppBar);

export default withStyles(styles)(Gif);