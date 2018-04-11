import React from 'react';
import Button from 'material-ui/Button';
import {withStyles} from 'material-ui/styles';
import Card from 'material-ui/Card';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import TextField from 'material-ui/TextField';
import List, {ListItem, ListItemText} from 'material-ui/List'
import {GifWriter} from 'omggif'
import GIFEncoder from './lib/jsgif/GIFEncoder'
import encode64 from './lib/jsgif/b64'
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from 'material-ui/Drawer';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import PreIcon from '@material-ui/icons/SkipPrevious';
import NextIcon from '@material-ui/icons/SkipNext';


import StopIcon from '@material-ui/icons/Stop';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Grid from 'material-ui/Grid';
import Dialog, {DialogActions, DialogContent, DialogContentText, DialogTitle,} from 'material-ui/Dialog';
import {CircularProgress} from 'material-ui/Progress';

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
    }
});

const frameMix = (fA, fZ, disposal, transparent_index) => {
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
}

class Gif extends React.Component {

    constructor(props) {
        super(props)
        this.handlePreviewOpen = this.handlePreviewOpen.bind(this);
        this.state = {
            currentFrame: 0,
            play: true,
            context: null,
            data: [],
            speed: 80,
            uploaded: false,
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

    showFrame = () => {
        const {context, gif, currentFrame, maxFrame, textData, gifInfo: {width, height}} = this.state
        let thisFrame = textData.filter(item => {
            let [a, z] = item.timeDuration
            if (currentFrame >= a && currentFrame < z) {
                return true
            } else {
                return false
            }
        });

        if (currentFrame >= 0 && currentFrame < maxFrame) {
            context.putImageData(gif[currentFrame], 0, 0)
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
            this.showFrame()
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
                this.showFrame()
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
        const {context, gif, currentFrame, maxFrame} = this.state
        context.putImageData(gif[0], 0, 0)
        this.setState({
            play: false
        })
    }

    handleSpeedChange = (event) => {
        this.setState({
            speed: event.target.value,
            play: false,
        })
        clearInterval(this.state.intervalId);
    }

    handleFileChange = (event) => {
        let canvas = document.getElementById("canvas")
        let context = canvas.getContext("2d")

        const file = event.target.files[0]
        this.setState({
            uploaded: true
        })
        let fr = new FileReader()

        fr.onload = () => {
            let gif = new GifReader(new Uint8Array(fr.result))
            let allFrames = []
            const frameNums = gif.numFrames()

            for (let i = 0; i < frameNums; i++) {
                let image = context.createImageData(gif.width, gif.height)
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
                        eachFrame.data = frameMix(eachFrame.data, parseFrames[index - 1].data, eachFrame.disposal, eachFrame.transparent_index)
                    } else if (eachFrame.disposal == 3) {
                        console.log(index)
                        eachFrame.data = parseFrames[index - 1].data
                    }
                    parseFrames.push(eachFrame)

                    let process = (index / frameNums * 100).toFixed()
                    this.showProcess(context, gif.width, gif.height, process)
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
                uploaded: false,
                gifInfo: {
                    width: gif.width,
                    height: gif.height
                },
                gifAllInfo: gif
            })
            this.showFirstFrame()
        }
        fr.readAsArrayBuffer(file)
    }

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

    handleStartChange = (event) => {
        const start = event.target.value
        clearInterval(this.state.intervalId);
        this.moveToFrame(start)
        this.setState({
            start
        })
    }

    handleEndChange = (event) => {
        const end = event.target.value
        clearInterval(this.state.intervalId);
        this.moveToFrame(end)
        this.setState({
            end
        })
    }

    handleTextChange = (event) => {
        const text = event.target.value
        this.setState({
            text
        })
    }

    AddTxt = () => {
        const {start, end, text} = this.state
        this.setState({
            textData: [...this.state.textData, {timeDuration: [start, end], text}]
        });
        this.saveToGif()
    }

    saveToGif = () => {
        const {gifInfo: {width, height}, maxFrame, speed} = this.state


        let canvas = document.getElementById("canvas")
        let context = canvas.getContext("2d")

        const {gif, textData} = this.state

        let encoder = new GIFEncoder();
        encoder.setRepeat(0); //auto-loop
        encoder.setDelay(speed);
        console.log(encoder.start())

        for (let currentFrame = 0; currentFrame < maxFrame; currentFrame++) {
            let thisFrame = textData.filter(item => {
                let [a, z] = item.timeDuration
                if (currentFrame >= a && currentFrame < z) {
                    return true
                } else {
                    return false
                }
            });

            if (currentFrame >= 0 && currentFrame < maxFrame) {
                context.putImageData(gif[currentFrame], 0, 0)
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
            encoder.addFrame(context)
            console.log(currentFrame)
        }

        encoder.finish()
        let gifUrl = 'data:image/gif;base64,' + encode64(encoder.stream().getData())

        fetch(gifUrl).then(res => res.blob()).then(blob => {
                this.setState({
                    newFileUrl: URL.createObjectURL(blob),
                    genGifDone: true,
                })
            }
        )
    }


    toggleDrawer = (open) => {
        this.setState({
            drawerOpen: open
        })
    }

    async handlePreviewOpen() {
        await this.setStateAsync({previewOpen: true})
        this.saveToGif()
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


    downloadFile = ()=>{
        const {newFileUrl} = this.state
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = newFileUrl;
        a.download = 'happy';
        a.click();
    }
    componentWillUnmount() {
        // use intervalId from the state to clear the interval
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
        }
    }

    render() {
        const {classes} = this.props;
        const {currentFrame, maxFrame, gif, uploaded, play, textData, genGifDone, newFileUrl} = this.state
        const bl = (currentFrame / maxFrame * 100).toFixed()
        const textIndex = textData.length
        return (
            <Grid container spacing={24}>

                <Grid item xs={12}>
                    <div className={classes.root}>
                        <AppBar position="static" color="secondary">
                            <Toolbar>
                                <IconButton className={classes.menuButton} color="inherit" aria-label="Menu"
                                            onClick={() => this.toggleDrawer(true)}>
                                    <MenuIcon/>
                                </IconButton>
                                <Typography variant="title" color="inherit" className={classes.flex}>
                                    HappyGif
                                </Typography>
                            </Toolbar>
                        </AppBar>
                    </div>
                </Grid>

                <Grid item xs={12} sm={12} md/>
                <Grid item xs={12} sm={12} md={6}>
                    <Card>
                        <div style={{margin: '0 auto'}}>
                            <canvas id="canvas" className={classes.media}>
                            </canvas>
                        </div>

                        <div style={{
                            textAlign: 'center'
                        }}>
                            <IconButton onClick={this.handlePreFrame} variant="raised">
                                <PreIcon/>
                            </IconButton>
                            {
                                play ? <IconButton onClick={this.handleStop} variant="raised">
                                    <StopIcon/>
                                </IconButton> : <IconButton onClick={this.handlePlay} variant="raised">
                                    <PlayArrowIcon/>
                                </IconButton>
                            }
                            <IconButton onClick={this.handleNextFrame} variant="raised">
                                <NextIcon/>
                            </IconButton>
                            <Slider value={currentFrame}
                                    min={0}
                                    style={{margin: '0 auto'}}
                                    max={maxFrame}
                                    onChange={this.onSliderChange}/>
                        </div>


                    </Card>
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

                    <div>
                        当前帧:{this.state.currentFrame}
                    </div>
                    <div>
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

                    <div>
                        <List component="nav">
                            {
                                textData.map((data, index) => {
                                    const {timeDuration, text} = data
                                    let [a, z] = timeDuration
                                    return <div id={`text-data-${index}`} key={`text-data-${index}`}>
                                        <ListItem button>
                                            <ListItemText primary={`${a} - ${z}:${text}`}/>
                                        </ListItem>
                                    </div>
                                })
                            }
                        </List>
                    </div>

                    <div>
                        <TextField
                            autoFocus
                            margin="dense"
                            id={`text-data-${textIndex}-start`}
                            label="开始"
                            type="number"
                            onChange={this.handleStartChange}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id={`text-data-${textIndex}-end`}
                            label="结束"
                            type="number"
                            onChange={this.handleEndChange}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id={`text-data-${textIndex}-text`}
                            label="字幕"
                            type="text"
                            onChange={this.handleTextChange}
                        />
                        <Button onClick={this.AddTxt} variant="raised">
                            添加
                        </Button>
                    </div>
                    <Button onClick={this.handlePreviewOpen}>预览</Button>
                    <Dialog
                        open={this.state.previewOpen}
                        onClose={this.handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >

                        {
                            genGifDone ? <div>
                                <DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-description">
                                        <img src={newFileUrl}/>
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