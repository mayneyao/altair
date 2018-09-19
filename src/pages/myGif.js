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
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import localStorageDB from "localstoragedb";

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
});

class TitlebarGridList extends React.Component {
	constructor(props) {
		super(props);
		let records = [];

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
		records = db.queryAll("gifx", {sort: [["ID", "DESC"]]});

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
												<IconButton className={classes.icon}
												            onClick={() => this.deleteRecord(tile.ID)}>
													<DeleteIcon/>
												</IconButton>
												<IconButton className={classes.icon}
												            href={`/#/?tmpId=${tile.ID}&from=myGif`}>
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

TitlebarGridList.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TitlebarGridList);