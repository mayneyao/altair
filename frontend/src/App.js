import React from 'react';
import Button from 'material-ui/Button';
import {withStyles} from 'material-ui/styles';
import {CircularProgress} from 'material-ui/Progress';
import Card from 'material-ui/Card';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import TextField from 'material-ui/TextField';
import List, {ListItem, ListItemText} from 'material-ui/List'
import {GifWriter} from 'omggif'
import GIFEncoder from './lib/jsgif/GIFEncoder'
import encode64 from './lib/jsgif/b64'

const GifReader = (require('omggif')).GifReader;

// const encode64 = new B64.Encoder();
// let GifWriter = (require('omggif')).GifWriter;


const Range = Slider.Range;

const styles = theme => ({
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
    card: {
        maxWidth: 345,
    },
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
        this.state = {
            currentFrame: 0,
            play: true,
            context: null,
            data: [],
            speed: 80,
            uploaded: false,
            textData: [],
        }
    }

    componentDidMount() {
        // store intervalId in the state so it can be accessed later:
        // var intervalId = setInterval(this.changeFrame, this.state.speed);
        // this.setState({intervalId: intervalId});
    }

    componentWillUnmount() {
        // use intervalId from the state to clear the interval
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
        }
    }

    canvasToGif = () => {

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
            console.log(gif[currentFrame])
            context.putImageData(gif[currentFrame], 0, 0)
        }

        console.log(context.getImageData(0, 0, width, height))


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

    handleFrameChange = (event) => {
        clearInterval(this.state.intervalId);
        this.moveToFrame(event.target.value)
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

            console.log(allFrames)
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
                    let image = context.createImageData(gif.width, gif.height)
                    eachFrame.data.map((i, index) => {
                        image.data[index] = i
                    })
                    images.push(image)
                    this.setState({
                        process: (index / frameNums).toFixed() * 100
                    })
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
            // this.changeFrame()
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
        this.setState({
            newFileUrl: gifUrl
        })

        // var capturer = new CCapture( { format: 'gif', workersPath: 'js/' } );
        // console.log(canvas.toDataURL('image/gif'))
        //
        // //
        // let fr = new FileReader()
        // let buffer = new ArrayBuffer(1024 * 1024 * 5)
        // let gifWriter = new GifWriter(buffer, width, height, {
        //     palette: 13
        // })
        //
        // let thisFrame = context.getImageData(0, 0, width, height)
        // console.log(thisFrame)
        //
        // const rgbData = thisFrame.data.map((item,index)=>{
        //     if(!(index%4==3)){
        //         return item
        //     }
        // })
        // gifWriter.addFrame(0, 0, width, height, rgbData , {
        //     disposal: 2
        // })
        //
        // // let fileBuffer = Uint8ClampedArray.from(buffer)
        // let fileBuffer = buffer.slice(0, gifWriter.end())
        //
        // let newGifFile = new File(fileBuffer, '测试.gif', {
        //     type: 'image/gif'
        // })
        //
        // let frd = new FileReader()
        // frd.onload = () => {
        //     this.setState({
        //         newFileUrl: frd.result
        //     })
        // }
        // frd.readAsDataURL(newGifFile)


    }

    render() {
        const {classes} = this.props;
        const {currentFrame, maxFrame, gif, uploaded, play, textData} = this.state
        const bl = (currentFrame / maxFrame * 100).toFixed()
        const textIndex = textData.length
        return (
            <div className={classes.wrap}>
                <Card className={classes.card}>
                    <canvas id="canvas" className={classes.media}>
                    </canvas>
                    <Slider value={currentFrame}
                            min={0}
                            max={maxFrame}
                            onChange={this.onSliderChange}/>
                </Card>
                <img src={this.state.newFileUrl}/>
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
                            <Button variant="raised" component="span" className={classes.button}>
                                {
                                    uploaded ? <CircularProgress
                                        variant="determinate"
                                        size={50}/> : '上传'
                                }
                            </Button>
                        </label>


                        {
                            play ? <Button onClick={this.handleStop} variant="raised">
                                暂停
                            </Button> : <Button onClick={this.handlePlay} variant="raised">
                                播放
                            </Button>
                        }

                        <Button onClick={this.saveToGif} variant="raised">
                            保存
                        </Button>
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
                                return <div id={`text-data-${index}`}>
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
            </div>
        );
    }
}


export default withStyles(styles)(Gif);