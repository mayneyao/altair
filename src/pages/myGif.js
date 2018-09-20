import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import DeleteIcon from '@material-ui/icons/Delete';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import initdb from '../common/initdb';
import axios from "axios";

const styles = theme => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
		overflow: 'hidden',
		backgroundColor: theme.palette.background.paper,
	},
	gridList: {
		width: '100%',
	},
	icon: {
		color: 'rgba(255, 255, 255, 0.54)',
	},
	redIcon: {
		color: 'rgba(255, 0, 0, 0.54)',
	},
});

class MyGifGridList extends React.Component {
	constructor(props) {
		super(props);
		let db = initdb();
		let records = db.queryAll("gifx", {sort: [["ID", "DESC"]]});
		this.state = {
			tileData: records,
			db
		}
	}

	fetchData = () => {
		const {db} = this.state;
		let records = db.queryAll("gifx", {sort: [["ID", "DESC"]]});
		this.setState({
			tileData: records,
		})
	};

	deleteRecord = (id) => {
		const {db} = this.state;
		db.deleteRows("gifx", {ID: id});
		db.commit();
		this.fetchData();
	};

	rmFav = (id) => {
		const {db} = this.state;
		db.update("gifx", {ID: id}, function (row) {
			row.is_fav = false;
			console.log(row);
			db.deleteRows("fav", {ID: row.fav_id});
			row.fav_id = undefined;
			return row;
		});
		db.commit();
		this.fetchData();
	};
	addFav = (id) => {
		const {db, tileData} = this.state;
		let now = new Date();
		let record = tileData.find(item => item.ID === id);

		let favID = db.insert("fav", {
			image_url: record.image_url,
			caption_template: record.caption_template,
			create_time: now.toISOString(),
			source_type: 'local',
			source_id: id
		});

		db.update("gifx", {ID: id}, function (row) {
			row.is_fav = true;
			row.fav_id = favID;
			return row;
		});

		db.commit();
		this.fetchData();
	};

	// upload tmp
	createTemplate = (imgUrl, captionTemplate) => {
		axios.post('https://gine.me/gif/tmp/', {
			'img_url': imgUrl,
			'caption_template': captionTemplate,
		}).then(res => {
			if (res.status === 201) {
				this.setState({
					uploadTemplateDone: true,
					showProcess: false,
				})
			}
		})
	};

	uploadTemplate = (id) => {
		const {tileData} = this.state;
		let record = tileData.find(item => item.ID === id);
		this.createTemplate(record.image_url, record.caption_template);
	};

	render() {
		const {classes} = this.props;
		const {tileData} = this.state;
		return (
			<Grid container>
				<Grid item md={3}></Grid>
				<Grid item xs={12} md={6}>
					<div className={classes.root}>
						<GridList cellHeight={200} className={classes.gridList} cols={2}>
							<GridListTile key="Subheader" cols={2} style={{height: 'auto'}}>
								<ListSubheader component="div">
									我的图库
								</ListSubheader>
							</GridListTile>
							{tileData.map(tile => (
								<GridListTile key={tile.id}>
									<img src={tile.image_url} alt={tile.title}/>
									<GridListTileBar
										title={tile.title}
										subtitle={<span/>}
										actionIcon={
											<div>
												{
													tile.is_fav ?
														<IconButton className={classes.redIcon}
														            onClick={() => this.rmFav(tile.ID)}>
															<FavoriteIcon/>
														</IconButton> :
														<IconButton className={classes.icon}
														            onClick={() => this.addFav(tile.ID)}>
															<FavoriteIcon/>
														</IconButton>

												}
												<IconButton className={classes.icon}
												            onClick={() => this.deleteRecord(tile.ID)}>
													<DeleteIcon/>
												</IconButton>
												<IconButton className={classes.icon}
												            onClick={() => this.uploadTemplate(tile.ID)}>
													<CloudUploadIcon/>
												</IconButton>
												<IconButton className={classes.icon}
												            href={`/#/?tmpId=${tile.ID}&from=myGif`}>
													<InfoIcon/>
												</IconButton>
											</div>
										}
									/>
								</GridListTile>
							))}
						</GridList>
					</div>
				</Grid>
				<Grid item md={3}></Grid>
			</Grid>
		);
	}
}

MyGifGridList.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyGifGridList);