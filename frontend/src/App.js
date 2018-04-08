import React from 'react';
import {withStyles} from 'material-ui/styles';
import Button from 'material-ui/Button';
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
});

const pixelMix = (pA, pZ) => {
    return parseInt((pA + pZ) / 2)
}

const frameMix = (fA, fZ) => {
    fA.map((a, index) => {
        return pixelMix(a, fZ[index])
    })
}

class Gif extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            currentFrame: 0,
            play: true,
            context: null,
            data: []
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

        // let img = new ImageData(mapAdd(gif[num].data, gif[0].data), gif[num].width, gif[num].height)

        context.putImageData(data[num], 0, 0)
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
            context.putImageData(gif[currentFrame], 0, 0)
        } else if (currentFrame == maxFrame) {
            clearInterval(this.state.intervalId);
            this.setState({
                currentFrame: 0,
                play: !this.state.play
            })
        }
    }


    handleFileChange = (event) => {
        let canvas = document.getElementById("canvas")
        let img = document.getElementById("img")
        let context = canvas.getContext("2d")
        // let gl = canvas.getContext('webgl');

        const file = event.target.files[0]

        // let buffer = gl.createBuffer(file);
        let fr = new FileReader()
        // let gif = new GifReader(new Uint8Array(file))
        // console.log(gif)
        fr.onload = () => {
            let gif = new GifReader(new Uint8Array(fr.result))

            let allFrames = []
            const frameNums = gif.numFrames()

            for (let i = 0; i < frameNums; i++) {
                let frame = context.createImageData(gif.width, gif.height)
                gif.decodeAndBlitFrameRGBA(i, frame.data);
                Object.assign(frame,gif.frameInfo(i))

                allFrames.push(frame)
            }


            console.log(gif)

            //  disposal = 1 不清除上一帧
            //  disposal = 2 清除上一帧

            // todo   帧数叠加处理

            let parseFrames = [allFrames[0]]

            allFrames.map((eachFrame, index) => {
                eachFrame.
            })

            gif.decodeAndBlitFrameRGBA(0, image0.data);
            console.log(gif.frameInfo(0))
            gif.decodeAndBlitFrameRGBA(1, image1.data);

            context.putImageData(image0, 0, 0)
            context.putImageData(image1, 0, 0)
        }
        fr.readAsArrayBuffer(file)


        // fr.readAsDataURL(file)

        // pixelGif.parse(file).then(gif => {
        //     console.log(gif)
        //     let frameData = []
        //     gif.map(i => {
        //         let img = new ImageData(i.data, i.width, i.height)
        //         frameData.push(img)
        //     })
        //     // gif.map((i, index) => {
        //     //     if (mapAdd(data[index] && data[index].data, gif[index + 1] && gif[index + 1].data)) {
        //     //         let img = new ImageData(mapAdd(data[index] && data[index].data, gif[index + 1] && gif[index + 1].data), gif[index].width, gif[index].height)
        //     //         data.push(img)
        //     //     }
        //     // })
        //     this.setState({
        //         gif: frameData,
        //         maxFrame: gif.length - 1,
        //         canvas,
        //         context,
        //         data: frameData,
        //     })
        //     this.changeFrame()
        // })
    }

    componentDidMount() {
        // store intervalId in the state so it can be accessed later:
        var intervalId = setInterval(this.changeFrame, 60);
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
            var intervalId = setInterval(this.changeFrame, 60);
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
        const {currentFrame, maxFrame, gif} = this.state
        const bl = (currentFrame / maxFrame * 100).toFixed()
        return (
            <div>
                <img src="" alt="" id="img"/>
                <canvas id="canvas"></canvas>
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
                    <span>当前帧:</span>
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
            </div>
        );
    }
}


export default withStyles(styles)(Gif);