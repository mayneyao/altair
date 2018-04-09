import React from 'react';
import {withStyles} from 'material-ui/styles';
import Button from 'material-ui/Button';
import {CircularProgress} from 'material-ui/Progress';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import TextField from 'material-ui/TextField';

let GifReader = (require('omggif')).GifReader;

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
    progress: {
        margin: theme.spacing.unit * 2,
    },
});

const pixelMix = (pA, pZ) => {
    return parseInt((pA + pZ) / 2)
}

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
            uploaded: false
        }
    }

    reStart = () => {
        this.setState({
            currentFrame: 0,
            play: true
        })
    }

    moveToFrame = (num) => {
        const {context} = this.state
        const {gif, currentFrame, maxFrame, data} = this.state
        context.putImageData(gif[num], 0, 0)
        this.setState({
            currentFrame: num
        })
    }

    handleFrameChange = (event) => {
        this.moveToFrame(event.target.value)
    }
    changeFrame = () => {
        const {context} = this.state
        const {gif, currentFrame, maxFrame} = this.state
        if (gif && currentFrame < maxFrame) {
            this.setState({
                currentFrame: this.state.currentFrame + 1,
            })
            if (gif[currentFrame]) {
                context.putImageData(gif[currentFrame], 0, 0)
            }
        } else if (currentFrame == maxFrame) {
            clearInterval(this.state.intervalId);
            this.setState({
                currentFrame: 0,
                play: !this.state.play
            })
        }
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

            this.setState({
                gif: images,
                maxFrame: frameNums,
                canvas,
                context,
                uploaded: false
            })
            this.changeFrame()
        }
        fr.readAsArrayBuffer(file)
    }

    componentDidMount() {
        // store intervalId in the state so it can be accessed later:
        var intervalId = setInterval(this.changeFrame, this.state.speed);
        this.setState({intervalId: intervalId});
    }

    componentWillUnmount() {
        // use intervalId from the state to clear the interval
        if (this.state.gif) {
            clearInterval(this.state.intervalId);
        }
    }

    handleStop = () => {
        const {play} = this.state
        if (play) {
            clearInterval(this.state.intervalId);
        } else {
            var intervalId = setInterval(this.changeFrame, this.state.speed);
            this.setState({intervalId: intervalId});
        }
        this.setState({
            play: !play
        })
    }

    onSliderChange = (range) => {
        const {maxFrame, gif} = this.state
        if (maxFrame && gif) {
            let [a, z] = range
            let frame = (maxFrame * a / 100).toFixed()
            this.moveToFrame(frame)
        }
    }

    render() {
        const style = {width: 400, margin: 50};
        const {classes} = this.props;
        const {currentFrame, maxFrame, gif, uploaded} = this.state
        const bl = (currentFrame / maxFrame * 100).toFixed()
        return (
            <div>
                <img src="" alt="" id="img"/>
                <canvas id="canvas"></canvas>
                <div>
                    {
                        uploaded ? <CircularProgress className={classes.progress}/> : <div/>
                    }
                </div>

                <div style={style}>
                    <Range
                        defaultValue={[0, 100]} min={0} max={100}
                        value={[gif ? bl : 0, 100]}
                        allowCross={false} onChange={this.onSliderChange}/>
                </div>
                <input
                    onChange={this.handleFileChange}
                    accept="image/*"
                    className={classes.input}
                    id="raised-button-file"
                    multiple
                    type="file"
                />
                <label htmlFor="raised-button-file">
                    <Button variant="raised" component="span" className={classes.button}>
                        Upload
                    </Button>
                </label>
                <Button onClick={this.handleStop} variant="raised">暂停/播放</Button>
                <div>
                    <TextField
                        id="frame"
                        label="frame"
                        className={classes.textField}
                        value={this.state.currentFrame}
                        onChange={this.handleFrameChange}
                        tyoe="number"
                        margin="normal"
                    />
                </div>
                <div>
                    <TextField
                        id="speed"
                        label="speed"
                        className={classes.textField}
                        value={this.state.speed}
                        onChange={this.handleSpeedChange}
                        tyoe="number"
                        margin="normal"
                    />
                </div>

            </div>
        );
    }
}


export default withStyles(styles)(Gif);