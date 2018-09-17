import React from 'react';
import {withStyles} from '@material-ui/core/styles';

import {HashRouter as Router, Link, Route} from "react-router-dom";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/Inbox';


import gifMaker from './pages/gifMaker';


const styles = theme => ({
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
	menuRoot: {
		width: 300
	}
});


const menus = [
	{
		path: '/',
		menu: <Link to="/" key='1'>
			<ListItem button>
				<ListItemIcon>
					<InboxIcon/>
				</ListItemIcon>
				<ListItemText primary="gif制作"/>
			</ListItem>
		</Link>
	}
];

class App extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			drawerOpen: false,
		}
	}

	toggleDrawer = (open) => {
		this.setState({
			drawerOpen: open
		})
	};

	render() {
		const {classes} = this.props;
		const {drawerOpen} = this.state
		return (
			<Router>
				<Grid container spacing={16}>

					<Grid item xs={12}>
						<div className={classes.root}>
							<AppBar position="static" color="default">
								<Toolbar>
									<IconButton className={classes.menuButton} color="inherit" aria-label="Menu"
									            onClick={() => this.toggleDrawer(true)}>
										<MenuIcon/>
									</IconButton>
									<Typography variant="title" color="inherit" className={classes.flex}>
										Altair
									</Typography>
								</Toolbar>
							</AppBar>
						</div>
					</Grid>

					<Drawer open={drawerOpen} onClose={() => this.toggleDrawer(false)}>
						<div
							tabIndex={0}
							role="button"
							onClick={() => this.toggleDrawer(false)}
							onKeyDown={() => this.toggleDrawer(false)}
						>

							<div className={classes.menuRoot}>
								<List component="nav">
									{
										menus.map(item => item.menu)
									}
								</List>
							</div>

						</div>
					</Drawer>

					<Grid item xs={12}>
						<main className={classes.content}>
							<Route key='1' path='/' exact component={gifMaker}/>
						</main>
					</Grid>
				</Grid>
			</Router>
		);
	}
}

export default withStyles(styles)(App);