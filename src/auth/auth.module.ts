import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { adminModel } from 'src/admin/schema/admin.schema';
import { featureModel } from 'src/features/model/feature.schema';
import { projectNeedModel } from 'src/needs/model/need.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'admin', schema: adminModel },
      { name: 'feature', schema: featureModel },
      { name: "projectneed", schema: projectNeedModel }
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
