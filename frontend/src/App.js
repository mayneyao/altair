import React from 'react';
import {withStyles} from 'material-ui/styles';
import Button from 'material-ui/Button';
import pixelGif from 'pixel-gif';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const Range = Slider.Range;

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
});

const mapAdd = (a, b) => {
    if (a && b) {
        return a.map((i, index) => {
            return i ^ b[index]
        })
    } else {
        return false
    }
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
        let context = canvas.getContext("2d")
        const file = event.target.files[0]
        pixelGif.parse(file).then(gif => {
            let data = [gif[0]]
            gif.map((i, index) => {
                console.log(index)
                console.log(data[index])
                if (mapAdd(data[index] && data[index].data, gif[index + 1] && gif[index + 1].data)) {
                    let img = new ImageData(mapAdd(data[index] && data[index].data, gif[index + 1] && gif[index + 1].data), gif[index].width, gif[index].height)
                    data.push(img)
                }
            })
            this.setState({
                gif,
                maxFrame: gif.length - 1,
                canvas,
                context,
                data,
            })
            this.changeFrame()
        })
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
                    <span>当前帧:</span><span>{
                    this.state.currentFrame
                }</span>
                </div>
            </div>
        );
    }
}


export default withStyles(styles)(Gif);