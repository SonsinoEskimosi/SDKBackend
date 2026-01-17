import { Router } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { EskimoId } from '../../common/models/EskimoId';
import { UserImageView } from '../../common/models/UserImageView';
import { DashboardPage } from '../views/DashboardPage';
import logger from '../../common/utils/logger';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { eskimoId } = req.query;
    
    if (!eskimoId) {
      const recentUsers = await EskimoId.find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      
      const html = renderToString(
        React.createElement(DashboardPage, {
          recentUsers: recentUsers.map(u => ({
            eskimoId: u.eskimoId,
            host: u.host,
            createdAt: u.createdAt.toISOString()
          }))
        })
      );
      return res.send(html);
    }

    const views = await UserImageView.aggregate([
      { $match: { eskimoId: eskimoId as string } },
      {
        $group: {
          _id: '$imageUrl',
          totalViews: { $sum: 1 },
          totalDuration: { $sum: '$viewDuration' }
        }
      },
      { $sort: { totalDuration: -1 } }
    ]);

    const imageViews = views.map(v => ({
      imageUrl: v._id,
      totalViews: v.totalViews,
      totalDuration: v.totalDuration
    }));

    const html = renderToString(
      React.createElement(DashboardPage, {
        eskimoId: eskimoId as string,
        imageViews
      })
    );

    res.send(html);
  } catch (error: any) {
    logger.error('[Dashboard] Error:', error);
    const html = renderToString(
      React.createElement(DashboardPage, {
        error: 'Failed to load analytics data'
      })
    );
    res.send(html);
  }
});

export default router;
