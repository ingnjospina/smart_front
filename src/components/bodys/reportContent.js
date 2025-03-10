import React from 'react'
import { Dependence } from '../sections/dependence'
import { PropTypes } from 'prop-types'
import { ImagesReport } from '../sections/imagesReport'
import { ReportEvaluation } from '../sections/reportEvaluation'
import { ReportInformation } from '../sections/reportInformation'
import { ReportStatus } from '../sections/reportStatus'
import { RowReport } from '../tools/styleContent'
import { UserInformation } from '../sections/userInformation'

export const ReportContent = (props) => {
	return (
		<>
			<RowReport xs={12}>
				<Dependence data={props.data} />
				<ReportInformation data={props.data} />
				<UserInformation data={props.data} />
			</RowReport>
			<RowReport xs={12}>
				<ReportStatus data={props.data} />
				<ReportEvaluation data={props.data} />
				<ImagesReport data={props.data} />
			</RowReport>
		</>
	)
}

ReportContent.propTypes = {
	data: PropTypes.object.isRequired,
}