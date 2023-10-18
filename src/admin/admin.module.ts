import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { featureModel } from 'src/features/model/feature.schema';
import { projectNeedModel } from 'src/needs/model/need.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { usedProductsModel } from 'src/used-products/model/usedProduct.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'feature', schema: featureModel },
      { name: 'projectneed', schema: projectNeedModel },
      { name: 'usedproducts', schema: usedProductsModel },
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
