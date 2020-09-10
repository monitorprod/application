import {React} from 'react';
import { Dropbox } from 'dropbox';

const dbx = new Dropbox({
    accessToken: "9OIaDmlW_AAAAAAAAAAAZ5y1VH8VNnTZDTZfAlbAD0mi0UgcueJQQR16PWtmt1S7",//TODO: hide this token
    fetch
});

export default dbx;