import GIFEncoder from './GIFEncoder'
import encode64 from './b64'


const workercode = () => {

    let onmessage = (e) => {
        const {speed, maxFrame, textData, gif, width, height,document} = e.data
        let canvas = document.getElementById("canvas")
        let context = canvas.getContext("2d")

        let encoder = new GIFEncoder();
        encoder.setRepeat(0); //auto-loop
        encoder.setDelay(speed);
        encoder.start()

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
        postMessage('Received from main: ' + (e.data));
    };

};


let code = workercode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], {type: "application/javascript"});
const MyWorker = URL.createObjectURL(blob);


export default MyWorker;


