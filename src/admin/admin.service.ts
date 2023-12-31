import { MailerService } from '@nestjs-modules/mailer/dist';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slug from 'slugify';
import {
  createAboutOutdorrDto,
  updateAboutOutdorrDto,
} from 'src/about-outdorr/dto/aboutoutdorr.dto';
import { AboutOutdorr } from 'src/about-outdorr/model/aboutoutdorr.schema';
import {
  createApplicationDto,
  updateApplicationDto,
} from 'src/applications/dto/application.dto';
import { Application } from 'src/applications/model/application.schema';
import cloudinary from 'src/config/cloudinary/cloudinary';
import {
  createContactDto,
  updateContactDto,
} from 'src/contact/dto/contact.dto';
import { Contact } from 'src/contact/model/contact.schema';
import {
  createFeatureDto,
  updateFeatureDto,
} from 'src/features/dto/feature.dto';
import { Feature } from 'src/features/model/feature.schema';
import {
  createProjectNeedDto,
  updateProjectNeedDto,
} from 'src/needs/dto/need.dto';
import { ProjectNeed } from 'src/needs/model/need.schema';
import {
  createProductDto,
  updateProductDto,
} from 'src/product/dto/product.dto';
import { Product } from 'src/product/model/product.schema';
import {
  CreateProjectDesignDetailsDto,
  UpdateProjectDesignDetailsDto,
} from 'src/project-design-details/dto/projectdesigndetails.dto';
import { ProjectDesignDetails } from 'src/project-design-details/model/projectdesigndetails.schema';
import {
  CreateProjectDesignDto,
  UpdateProjectDesignDto,
} from 'src/project-design/dto/projectdesign.dto';
import { ProjectDesign } from 'src/project-design/model/projectdesign.schema';
import {
  createProjectDto,
  updateProjectDto,
} from 'src/projects/dto/project.dto';
import { Project } from 'src/projects/model/project.schema';
import { RequestProject } from 'src/request-project/model/requestproject.schema';
import {
  createSpecificationDto,
  updateSpecificationDto,
} from 'src/specifications/dto/specification.dto';
import { Specification } from 'src/specifications/model/specification.schema';
import {
  createSubProductDto,
  updateSubProductDto,
} from 'src/subproduct/dto/subproduct.dto';
import { Subproduct } from 'src/subproduct/model/subproduct.schema';
import { sendEmailText } from 'src/subscribe/dto/subscribe.dto';
import { Subscribe } from 'src/subscribe/model/subscribe.schema';
import {
  createUsedProductsDto,
  updateUsedProductsDto,
} from 'src/used-products/dto/usedproduct.dto';
import { UsedProducts } from 'src/used-products/model/usedproduct.schema';
import { updateWhyOutdorrDto } from 'src/why-outdorr/dto/whyoutdorr.dto';
import { WhyOutdorr } from 'src/why-outdorr/model/whyoutdorr.schema';

@Injectable()
export class AdminService {
  constructor(
    private mailerService: MailerService,
    @InjectModel('feature') private featureModel: Model<Feature>,
    @InjectModel('projectneed') private projectNeedModel: Model<ProjectNeed>,
    @InjectModel('usedproducts') private usedProductsModel: Model<UsedProducts>,
    @InjectModel('application') private applicationModel: Model<Application>,
    @InjectModel('project') private projectModel: Model<Project>,
    @InjectModel('specification')
    private specificationModel: Model<Specification>,
    @InjectModel('subproduct') private subProductModel: Model<Subproduct>,
    @InjectModel('product') private productModel: Model<Product>,
    @InjectModel('contact') private contactModel: Model<Contact>,
    @InjectModel('subscribe') private subscribeModel: Model<Subscribe>,
    @InjectModel('whyoutdorr') private whyOutdorrModel: Model<WhyOutdorr>,
    @InjectModel('aboutoutdorr') private aboutOutdorrModel: Model<AboutOutdorr>,
    @InjectModel('projectdesign')
    private projectDesignModel: Model<ProjectDesign>,
    @InjectModel('projectdesigndetail')
    private projectDesignDetailsModel: Model<ProjectDesignDetails>,
    @InjectModel('requestproject')
    private requestProjectModel: Model<RequestProject>,
  ) { }

  // create feature - test edildi
  async createFeature(
    CreateFeatureDto: createFeatureDto,
    file: Express.Multer.File,
  ): Promise<Feature> {
    const { title, description, subProductId, projectId } = CreateFeatureDto;
    if (!file) {
      const feature = await this.featureModel.create({
        title,
        description,
        projectId,
      });
      await this.projectModel.findOneAndUpdate(
        { _id: feature.projectId },
        { $push: { featuresId: feature._id } },
      );
      return feature;
    } else {
      const iconUrl = await cloudinary.uploader.upload(file.path, {
        public_id: file.originalname,
      });
      const feature = await this.featureModel.create({
        title,
        description,
        subProductId,
        icon: iconUrl.url,
      });
      await this.subProductModel.findOneAndUpdate(
        { _id: feature.subProductId },
        { $push: { featuresIds: feature._id } },
      );
      return feature;
    }
  }

  // update feature - test edildi
  async updateFeature(
    id: string,
    UpdateFeatureDto: updateFeatureDto,
    file: Express.Multer.File,
  ): Promise<Feature> {
    const feature = await this.featureModel.findById(id);
    if (!feature) {
      throw new HttpException(
        'The feature you are looking for was not found',
        HttpStatus.NOT_FOUND,
      );
    } else if (!file) {
      const { title, description } = UpdateFeatureDto;
      return await this.featureModel.findByIdAndUpdate(
        id,
        { $set: { title, description } },
        { new: true },
      );
    } else {
      const iconUrl = await cloudinary.uploader.upload(file.path, {
        public_id: file.originalname,
      });
      return await this.featureModel.findByIdAndUpdate(id, { $set: { ...UpdateFeatureDto, icon: iconUrl.url } }, { new: true });
    }
  }

  // delete feature - test edildi
  async deleteFeature(id: string): Promise<string> {
    const feature = await this.featureModel.findById(id);
    if (!feature) {
      throw new HttpException(
        'The feature you want to remove was not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const deleteFeature = await this.featureModel.findByIdAndDelete(id);
    const updateSubProduct = await this.subProductModel.findOneAndUpdate(
      { _id: deleteFeature.subProductId },
      { $pull: { featuresIds: deleteFeature._id } },
    );
    if (!updateSubProduct) {
      await this.projectModel.findOneAndUpdate(
        { _id: deleteFeature.projectId },
        { $pull: { featuresId: deleteFeature._id } },
      );
    }
    return 'Project feature removed';
  }

  // get single feature - test edildi
  async getSingleFeature(id: string): Promise<Feature> {
    const feature = await this.featureModel.findById(id);
    if (!feature) {
      throw new HttpException('Feature not found', HttpStatus.NOT_FOUND);
    } else {
      return feature;
    }
  }

  // get all features - test edildi
  async getAllFeatures(): Promise<Feature[]> {
    return await this.featureModel.find();
  }

  // create Project needs - test edildi
  async createProjectNeed(
    CreateProjectNeedDto: createProjectNeedDto,
  ): Promise<ProjectNeed> {
    return await this.projectNeedModel.create(CreateProjectNeedDto);
  }

  // update Project needs - test edildi
  async updateProjectNeed(
    id: string,
    UpdateProjectNeedDto: updateProjectNeedDto,
  ): Promise<ProjectNeed> {
    const projectNeedExist = await this.projectNeedModel.findById(id);
    if (!projectNeedExist) {
      throw new HttpException(
        'No project requirements found to be modified',
        HttpStatus.NOT_FOUND,
      );
    } else {
      return await this.projectNeedModel.findByIdAndUpdate(id, { $set: UpdateProjectNeedDto }, { new: true });
    }
  }

  // delete Project needs - test edildi
  async deleteProjectNeed(id: string): Promise<string> {
    const projectNeed = await this.projectNeedModel.findById(id);
    if (!projectNeed) {
      throw new HttpException(
        'The project needs you want to delete were not found',
        HttpStatus.NOT_FOUND,
      );
    } else {
      await this.projectNeedModel.findByIdAndDelete(id);
      return 'Project need removed';
    }
  }

  // get single project needs - test edildi
  async getSingleProjectNeed(id: string): Promise<ProjectNeed> {
    const projectNeed = await this.projectNeedModel.findById(id);
    if (!projectNeed) {
      throw new HttpException('Project needs not found', HttpStatus.NOT_FOUND);
    } else {
      return projectNeed;
    }
  }

  //get All project needs - test edildi
  async getAllProjectNeed(): Promise<ProjectNeed[]> {
    return await this.projectNeedModel.find();
  }

  // create used Products - test edildi
  async createUsedProducts(
    CreateUsedProductsDto: createUsedProductsDto,
    files: Express.Multer.File[],
  ): Promise<UsedProducts> {
    const fileUrls = [];
    for (let i = 0; i < files.length; i++) {
      const fileUrl = await cloudinary.uploader.upload(files[i].path, {
        public_id: files[i].originalname,
      });
      fileUrls.push(fileUrl.url);
    }
    return await this.usedProductsModel.create({
      ...CreateUsedProductsDto,
      photos: fileUrls,
    });
  }

  // update used Products - duzelisler ve test edildi
  async updateUsedProducts(
    id: string,
    UpdateUsedProducts: updateUsedProductsDto,
    files: Express.Multer.File[],
  ): Promise<UsedProducts> {
    const usedProductsExist = await this.usedProductsModel.findById(id);
    if (!usedProductsExist) {
      throw new HttpException(
        'The used products you want to change were not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (files && files[0] && files[0].path) {
      const fileUrls = [];
      for (let i = 0; i < files.length; i++) {
        const fileUrl = await cloudinary.uploader.upload(files[i].path, {
          public_id: files[i].originalname,
        });
        fileUrls.push(fileUrl.url);
      }
      return await this.usedProductsModel.findByIdAndUpdate(
        id,
        { $set: { ...UpdateUsedProducts, photos: fileUrls } },
        { new: true },
      );
    } else {
      return await this.usedProductsModel.findByIdAndUpdate(
        id,
        { $set: { ...UpdateUsedProducts } },
        { new: true },
      );
    }
  }

  // delete used Products - test edildi
  async deleteUsedProducts(id: string): Promise<string> {
    const usedProducts = await this.usedProductsModel.findById(id);
    if (!usedProducts) {
      throw new HttpException(
        'The used products you want to delete were not found',
        HttpStatus.NOT_FOUND,
      );
    } else {
      await this.usedProductsModel.findByIdAndDelete(id);
      return 'Removed used products';
    }
  }

  // get single used Products - test edildi
  async getSingleUsedProducts(id: string): Promise<UsedProducts> {
    const usedPorducts = await this.usedProductsModel.findById(id);
    if (!usedPorducts) {
      throw new HttpException('Used products not found', HttpStatus.NOT_FOUND);
    } else {
      return usedPorducts;
    }
  }

  // get all used Products - test edildi
  async getAllUsedProducts(): Promise<UsedProducts[]> {
    return await this.usedProductsModel.find();
  }

  // create product application - test edildi
  async createApplication(
    CreateApplicationDto: createApplicationDto,
    files: Express.Multer.File[],
  ): Promise<Application> {
    const applicationExist = await this.applicationModel.findOne({
      title: CreateApplicationDto.title,
    });
    if (applicationExist) {
      throw new HttpException(
        'Application already exists',
        HttpStatus.CONFLICT,
      );
    }
    const fileUrls = [];
    for (let i = 0; i < files.length; i++) {
      const fileUrl = await cloudinary.uploader.upload(files[i].path, {
        public_id: files[i].originalname,
      });
      fileUrls.push(fileUrl.url);
    }
    const application = await this.applicationModel.create({
      ...CreateApplicationDto,
      photos: fileUrls,
    });
    await this.subProductModel.findOneAndUpdate(
      { _id: application.subProductId },
      { $push: { applicationIds: application._id } },
    );
    return application;
  }

  // update product application - duzelis ve test edildi
  async updateApplication(
    id: string,
    UpdateApplicationDto: updateApplicationDto,
    files: Express.Multer.File[],
  ): Promise<Application> {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new HttpException(
        'The application you want to update was not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (files && files[0] && files[0].path) {
      const fileUrls = [];
      for (let i = 0; i < files.length; i++) {
        const fileUrl = await cloudinary.uploader.upload(files[i].path, {
          public_id: files[i].originalname,
        });
        fileUrls.push(fileUrl.url);
      }
      return await this.applicationModel.findByIdAndUpdate(
        id,
        { $set: { ...UpdateApplicationDto, photos: fileUrls } },
        { new: true },
      );
    } else {
      return await this.applicationModel.findByIdAndUpdate(
        id,
        { $set: { ...UpdateApplicationDto } },
        { new: true },
      );
    }
  }

  // delete product application - test edildi
  async deleteApplication(id: string): Promise<string> {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new HttpException(
        'The application you want to uninstall was not found',
        HttpStatus.NOT_FOUND,
      );
    } else {
      const application = await this.applicationModel.findByIdAndDelete(id);
      await this.subProductModel.findOneAndUpdate(
        { _id: application.subProductId },
        { $pull: { applicationIds: application._id } },
      );
      return 'The application has been deleted';
    }
  }

  // get single product application - test edildi
  async getSingleApplication(id: string): Promise<Application> {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    } else {
      return application;
    }
  }

  // get all product application - test edildi
  async getAllApplication(): Promise<Application[]> {
    return await this.applicationModel.find();
  }

  // create project - test edildi
  async createProject(
    CreateProjectDto: createProjectDto,
    files: Express.Multer.File[],
  ): Promise<Project> {
    const projectExist = await this.projectModel.findOne({
      title: CreateProjectDto.title,
    });
    if (projectExist) {
      throw new HttpException(
        'The project already exists',
        HttpStatus.CONFLICT,
      );
    }
    const fileUrls = [];
    for (let i = 0; i < files.length; i++) {
      const fileUrl = await cloudinary.uploader.upload(files[i].path, {
        public_id: files[i].originalname,
      });
      fileUrls.push(fileUrl.url);
    }
    return await this.projectModel.create({ ...CreateProjectDto, slug: slug(CreateProjectDto.title, { lower: true }), photos: fileUrls });
  }

  // update project - test edildi
  async updateProject(
    id: string,
    UpdateProjectDto: updateProjectDto,
    files: Express.Multer.File[],
  ): Promise<Project> {
    const projectExist = await this.projectModel.findById(id);
    const fileUrls = [];
    // eger proyekt yoxdursa
    if (!projectExist)
      throw new HttpException(
        'The project to be changed was not found',
        HttpStatus.NOT_FOUND,
      );
    const project = await this.projectModel.findOne({
      title: UpdateProjectDto.title,
    });
    // eger databazada eyni adda proyekt varsa
    if (project)
      throw new HttpException(
        'The project already exists',
        HttpStatus.CONFLICT,
      );
    // eger proyekt adi ve sekili varsa - ok
    if (UpdateProjectDto.title || (files && files[0] && files[0].path)) {
      if (files && files[0] && files[0].path) {
        for (let i = 0; i < files.length; i++) {
          const fileUrl = await cloudinary.uploader.upload(files[i].path, {
            public_id: files[i].originalname,
          });
          fileUrls.push(fileUrl.url);
        }
        if (UpdateProjectDto.title) {
          return await this.projectModel.findByIdAndUpdate(
            id,
            {
              $set: {
                ...UpdateProjectDto,
                slug: slug(UpdateProjectDto.title, { lower: true }),
                photos: fileUrls,
              },
            },
            { new: true },
          );
          // eger proyekt adi yox ve fayl varsa
        } else {
          return await this.projectModel.findByIdAndUpdate(
            id,
            { $set: { ...UpdateProjectDto, photos: fileUrls } },
            { new: true },
          );
        }
      }
      // eger proyekt adi var ve fayl yoxsa
      return await this.projectModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...UpdateProjectDto,
            slug: slug(UpdateProjectDto.title, { lower: true }),
          },
        },
        { new: true },
      );
    }
    // Title və fayl yoxdursa
    return await this.projectModel.findByIdAndUpdate(
      id,
      { $set: { ...UpdateProjectDto } },
      { new: true },
    );
  }

  // delete project - sorusmaq
  // async deleteProject(id: string): Promise<string> {
  //   const project = await this.projectModel.findById(id)
  //   if (!project) {
  //     throw new HttpException('The project you want to delete was not found', HttpStatus.NOT_FOUND)
  //   } else {
  //     await this.projectModel.findByIdAndDelete(id)
  //     return 'The project has been deleted'
  //   }
  // }

  // get single project - test edildi
  async getSingleProject(slug: string): Promise<Project> {
    const project = await this.projectModel
      .findOne({ slug })
      .populate([
        { path: 'featuresId' },
        { path: 'needsId' },
        { path: 'usedProductsId' },
      ]);
    if (!project) {
      throw new HttpException(
        'The project you are looking for has not been found',
        HttpStatus.NOT_FOUND,
      );
    }
    return project;
  }

  // get all project - test edildi
  async getAllProject(): Promise<Project[]> {
    return await this.projectModel.find();
  }

  // create specification - test edildi
  async createSpecification(
    CreateSpecificationDto: createSpecificationDto,
  ): Promise<Specification> {
    const { key, value, subProductId } = CreateSpecificationDto;
    const specificationExist = await this.specificationModel.findOne({
      key,
      value,
      subProductId,
    });
    if (specificationExist) {
      throw new HttpException(
        'The specification has already been created',
        HttpStatus.CONFLICT,
      );
    }
    const specification = await this.specificationModel.create(
      CreateSpecificationDto,
    );
    await this.subProductModel.findOneAndUpdate(
      { _id: specification.subProductId },
      { $push: { specifications: specification._id } },
    );
    return specification;
  }

  // update specification - test edildi
  async updateSpecification(
    id: string,
    UpdateSpecificationDto: updateSpecificationDto,
  ): Promise<Specification> {
    const specificationExist = await this.specificationModel.findById(id);
    if (!specificationExist) {
      throw new HttpException('Specification not found', HttpStatus.NOT_FOUND);
    }
    const { key, value } = UpdateSpecificationDto;
    const specification = await this.specificationModel.findOne({ key, value });
    if (specification) {
      throw new HttpException(
        'The specification has already been created',
        HttpStatus.CONFLICT,
      );
    }
    return await this.specificationModel.findByIdAndUpdate(
      id,
      { $set: UpdateSpecificationDto },
      { new: true },
    );
  }

  // delete specification - test edildi
  async deleteSpecification(id: string): Promise<string> {
    const specification = await this.specificationModel.findById(id);
    if (!specification) {
      throw new HttpException('Specification not found', HttpStatus.NOT_FOUND);
    }
    await this.specificationModel.findByIdAndDelete(id);
    await this.subProductModel.findOneAndUpdate(
      { _id: specification.subProductId },
      { $pull: { specifications: specification._id } },
    );
    return 'The specification has been removed';
  }

  // get single specification - test edildi
  async getSingleSpecification(id: string): Promise<Specification> {
    const specification = await this.specificationModel.findById(id);
    if (!specification) {
      throw new HttpException('Specification not found', HttpStatus.NOT_FOUND);
    }
    return specification;
  }

  // get all specification - test edildi
  async getAllSpecification(): Promise<Specification[]> {
    return await this.specificationModel.find();
  }

  // create product - test edildi
  async createProduct(
    CreateProductDto: createProductDto,
    file: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.productModel.findOne({
      title: CreateProductDto.title,
    });
    if (product) {
      throw new HttpException(
        'The product is already available',
        HttpStatus.CONFLICT,
      );
    }
    const fileuRL = await cloudinary.uploader.upload(file.path, {
      public_id: file.originalname,
    });
    return await this.productModel.create({
      ...CreateProductDto,
      slug: slug(CreateProductDto.title, { lower: true }),
      photo: fileuRL.url,
    });
  }

  // update product - test edildi
  async updateProduct(
    id: string,
    UpdateProductDto: updateProductDto,
    file: Express.Multer.File,
  ): Promise<Product> {
    const productExist = await this.productModel.findById(id);
    // eger product yoxdursa
    if (!productExist)
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    const product = await this.productModel.findOne({
      title: UpdateProductDto.title,
    });
    // eger bazada eyni product varsa
    if (product)
      throw new HttpException(
        'The product is already available in the database',
        HttpStatus.CONFLICT,
      );
    if (UpdateProductDto.title || (file && file.path)) {
      // fayl varsa title yoxsa
      if (file && file.path) {
        const fileUrl = await cloudinary.uploader.upload(file.path, {
          public_id: file.originalname,
        });
        return await this.productModel.findByIdAndUpdate(
          id,
          { $set: { ...UpdateProductDto, photo: fileUrl.url } },
          { new: true },
        );
      }
      // title varsa fayl yoxsa
      if (UpdateProductDto.title) {
        return await this.productModel.findByIdAndUpdate(
          id,
          {
            $set: {
              ...UpdateProductDto,
              slug: slug(UpdateProductDto.title, { lower: true }),
            },
          },
          { new: true },
        );
      }
    }
    // fayl ve title yoxsa
    return await this.productModel.findByIdAndUpdate(
      id,
      { $set: { ...UpdateProductDto } },
      { new: true },
    );
  }

  // delete product - test edildi
  async deleteProduct(id: string): Promise<string> {
    const productExist = await this.productModel.findById(id);
    if (!productExist) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    await this.productModel.findByIdAndDelete(id);
    return 'Product deleted';
  }

  // // get single product - test edildi
  async getSingleProduct(slug: string): Promise<Product> {
    const product = await this.productModel.findOne({ slug }).populate({
      path: 'subProductIds',
      select: ['title', 'description', 'photos', 'cover_photo', 'slug'],
    });
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  // get all product - test edildi
  async getAllProduct(): Promise<Product[]> {
    return await this.productModel.find().populate({
      path: 'subProductIds',
      select: ['title', 'description', 'photos', 'cover_photo', 'slug'],
    });
  }

  // create sub product  - test edildi
  async createSubProduct(
    CreateSubProductDto: createSubProductDto,
    files: {
      cover_photo: Express.Multer.File[];
      photos: Express.Multer.File[];
    },
  ): Promise<Subproduct> {
    const { title } = CreateSubProductDto;
    const subProductExist = await this.subProductModel.findOne({ title });
    if (subProductExist) {
      throw new HttpException(
        'Sub product already created',
        HttpStatus.CONFLICT,
      );
    }
    const coverFileUrl = await cloudinary.uploader.upload(
      files.cover_photo[0].path,
      {
        public_id: files.cover_photo[0].originalname,
      },
    );
    const fileUrls = [];
    for (let i = 0; i < files.photos.length; i++) {
      const fileUrl = await cloudinary.uploader.upload(files.photos[i].path, {
        public_id: files.photos[i].originalname,
      });
      fileUrls.push(fileUrl.url);
    }
    const subProduct = await this.subProductModel.create({
      ...CreateSubProductDto,
      cover_photo: coverFileUrl.url,
      photos: fileUrls,
      slug: slug(CreateSubProductDto.title),
    });
    await this.productModel.findOneAndUpdate(
      { _id: subProduct.productId },
      { $push: { subProductIds: subProduct.id } },
      { new: true },
    );
    return subProduct;
  }

  // update sub product - test edildi
  async updateSubProduct(
    id: string,
    UpdateSubproductDto: updateSubProductDto,
    files: {
      cover_photo: Express.Multer.File[];
      photos: Express.Multer.File[];
    },
  ): Promise<Subproduct> {
    const subProductExist = await this.subProductModel.findById(id);
    // subproduct bazada olub - olmadigi yoxlanilir
    if (!subProductExist)
      throw new HttpException('Sub product not found', HttpStatus.NOT_FOUND);
    const subProduct = await this.subProductModel.findOne({
      title: UpdateSubproductDto.title,
    });
    // subproduct artıq bazada var yoxlanılır
    if (subProduct)
      throw new HttpException(
        'Subproduct already exists in the database',
        HttpStatus.CONFLICT,
      );
    // title ve ya file-lardan her hansi biri varsa
    if (
      UpdateSubproductDto.title ||
      (files.cover_photo &&
        files.cover_photo[0] &&
        files.cover_photo[0].path) ||
      (files.photos && files.photos[0] && files.photos[0].path)
    ) {
      // eger cover file varsa
      if (
        files.cover_photo &&
        files.cover_photo[0] &&
        files.cover_photo[0].path
      ) {
        const coverFileUrl = await cloudinary.uploader.upload(
          files.cover_photo[0].path,
          { public_id: files.cover_photo[0].originalname },
        );
        return await this.subProductModel.findByIdAndUpdate(
          id,
          { $set: { ...UpdateSubproductDto, cover_photo: coverFileUrl.url } },
          { new: true },
        );
      }
      // eger photos varsa
      if (files.photos && files.photos[0] && files.photos[0].path) {
        const fileUrls = [];
        for (let i = 0; i < files.photos.length; i++) {
          const fileUrl = await cloudinary.uploader.upload(
            files.photos[i].path,
            { public_id: files.photos[i].originalname },
          );
          fileUrls.push(fileUrl.url);
        }
        return await this.subProductModel.findByIdAndUpdate(
          id,
          { $set: { ...UpdateSubproductDto, photos: fileUrls } },
          { new: true },
        );
      }
    }
    // eger title varsa
    if (UpdateSubproductDto.title) {
      return await this.subProductModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...UpdateSubproductDto,
            slug: slug(UpdateSubproductDto.title, { lower: true }),
          },
        },
        { new: true },
      );
    }
    // hec biri yoxsa
    return await this.subProductModel.findByIdAndUpdate(
      id,
      { $set: { ...UpdateSubproductDto } },
      { new: true },
    );
  }

  // delete sub product - test edildi
  async deleteSubProduct(id: string): Promise<string> {
    const subProductExist = await this.subProductModel.findById(id);
    if (!subProductExist) {
      throw new HttpException('Sub product not found', HttpStatus.NOT_FOUND);
    }
    const deleteSubProduct = await this.subProductModel.findByIdAndDelete(id);
    await this.productModel.findOneAndUpdate(
      { _id: deleteSubProduct.productId },
      { $pull: { subProductIds: deleteSubProduct._id } },
    );
    return 'The sub product has been removed';
  }

  // get single sub product - test edildi
  async getSingleSubProduct(slug: string): Promise<Subproduct> {
    const subProductExist = await this.subProductModel
      .findOne({ slug })
      .populate([{ path: 'featuresIds' }, { path: 'specifications' }]);
    if (!subProductExist) {
      throw new HttpException('Sub product not found', HttpStatus.NOT_FOUND);
    }
    return subProductExist;
  }

  // get all sub product - test edildi
  async getAllSubProduct(): Promise<Subproduct[]> {
    return await this.subProductModel.find();
  }

  // create contact - test edildi
  async createContact(CreateContactDto: createContactDto): Promise<Contact> {
    const contactExist = await this.contactModel.findOne({
      location: CreateContactDto.location,
    });
    if (contactExist) {
      throw new HttpException('Location already created', HttpStatus.CONFLICT);
    }
    return await this.contactModel.create(CreateContactDto);
  }

  // update contact - test edildi
  async updateContact(
    id: string,
    UpdateContactDto: updateContactDto,
  ): Promise<Contact> {
    const contactExist = await this.contactModel.findById(id);
    if (!contactExist) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    } else {
      const contactLocationExist = await this.contactModel.findOne({
        location: UpdateContactDto.location,
      });
      if (contactLocationExist) {
        throw new HttpException(
          'Location already created',
          HttpStatus.CONFLICT,
        );
      }
    }
    return await this.contactModel.findByIdAndUpdate(
      id,
      { $set: UpdateContactDto },
      { new: true },
    );
  }

  // delete contact - test edildi
  async deleteContact(id: string): Promise<string> {
    const contactExist = await this.contactModel.findById(id);
    if (!contactExist) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }
    await this.contactModel.findByIdAndDelete(id);
    return 'Contact information has been removed';
  }

  // get single contact - test edildi
  async getSingleContact(id: string): Promise<Contact> {
    const contactExist = await this.contactModel.findById(id);
    if (!contactExist) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }
    return contactExist;
  }

  // get all contact - test edildi
  async getAllContact(): Promise<Contact[]> {
    return await this.contactModel.find();
  }

  // get subscribe - test edildi
  async getAllSubscribe(): Promise<Subscribe[]> {
    return await this.subscribeModel.find();
  }

  // send email - test edildi
  async sendEmail(text: sendEmailText): Promise<string> {
    const subscribers = await this.subscribeModel.find();
    for (let i = 0; i < subscribers.length; i++) {
      this.mailerService.sendMail({
        from: 'quliyevnamiq8@gmail.com',
        to: `${subscribers[i].email}`,
        subject: 'Outdorr new information',
        text: `${text.text}`,
      });
    }
    return 'An email has been sent to site subscribers';
  }

  // create why-outdorr - test edildi
  // async createWhyOutdorr(
  //   CreateWhyOutdorrDto: createWhyOutdorrDto,
  // ): Promise<WhyOutdorr> {
  //   const { title, description } = CreateWhyOutdorrDto;
  //   const whyOutdorrExist = await this.whyOutdorrModel.findOne({
  //     title,
  //     description,
  //   });
  //   if (whyOutdorrExist) {
  //     throw new HttpException(
  //       'Title and description are already created',
  //       HttpStatus.CONFLICT,
  //     );
  //   } else {
  //     return await this.whyOutdorrModel.create(CreateWhyOutdorrDto);
  //   }
  // }

  // update why-outdorr - test edildi
  async updateWhyOutdorr(
    id: string,
    UpdateOutdorrDto: updateWhyOutdorrDto,
  ): Promise<WhyOutdorr> {
    const whyoutdorrExist = await this.whyOutdorrModel.findById(id);
    if (!whyoutdorrExist) {
      throw new HttpException(
        'No information found to change',
        HttpStatus.NOT_FOUND,
      );
    }
    // const { title, description } = UpdateOutdorrDto;
    // const whyoutdorr = await this.whyOutdorrModel.findOne({
    //   title,
    //   description,
    // });
    // if (whyoutdorr) {
    //   throw new HttpException(
    //     'Title and description are already created',
    //     HttpStatus.CONFLICT,
    //   );
    // }
    return await this.whyOutdorrModel.findByIdAndUpdate(
      id,
      { $set: UpdateOutdorrDto },
      { new: true },
    );
  }

  // // delete why-outdorr - sorusmaq
  // async deleteWhyOutdorr(id: string): Promise<string> {
  //   const whyoutdorrExist = await this.whyOutdorrModel.findById(id)
  //   if (!whyoutdorrExist) {
  //     throw new HttpException('The information you want to delete was not found', HttpStatus.NOT_FOUND)
  //   }
  //    await this.whyOutdorrModel.findByIdAndDelete(id)
  //    return 'The data has been deleted'
  // }

  // get single why-outdorr - test edildi
  async getSingleWhyOutdorr(id: string): Promise<WhyOutdorr> {
    const whyoutdorrExist = await this.whyOutdorrModel.findById(id);
    if (!whyoutdorrExist) {
      throw new HttpException(
        'The information you were looking for was not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return whyoutdorrExist;
  }

  // get all why-outdorr - test edildi
  async getAllWhyOutdorr(): Promise<WhyOutdorr[]> {
    return await this.whyOutdorrModel.find();
  }

  // create about-outdorr - test edildi
  async createAboutOutdorr(
    CreateAboutOutdorrDto: createAboutOutdorrDto,
  ): Promise<AboutOutdorr> {
    const { key, value } = CreateAboutOutdorrDto;
    const aboutOutdorrExist = await this.aboutOutdorrModel.findOne({
      key,
      value,
    });
    if (aboutOutdorrExist) {
      throw new HttpException(
        'The information about outdoor has already been created',
        HttpStatus.CONFLICT,
      );
    }
    const aboutOutdorr = await this.aboutOutdorrModel.create(
      CreateAboutOutdorrDto,
    );
    await this.whyOutdorrModel.findOneAndUpdate(
      { _id: aboutOutdorr.why_outdorr },
      { $push: { about_outdorr: aboutOutdorr._id } },
    );
    return aboutOutdorr;
  }

  // update about-outdorr - test edildi
  async updateAboutOutdorr(
    id: string,
    UpdateAboutOutdorrDto: updateAboutOutdorrDto,
  ): Promise<AboutOutdorr> {
    const aboutOutdorrExist = await this.aboutOutdorrModel.findById(id);
    if (!aboutOutdorrExist) {
      throw new HttpException(
        'The information you want to change does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    const { key, value } = UpdateAboutOutdorrDto;
    const aboutOutdorr = await this.aboutOutdorrModel.findOne({ key, value });
    if (aboutOutdorr) {
      throw new HttpException(
        'There is information already mentioned about the outdoor',
        HttpStatus.CONFLICT,
      );
    } else {
      return await this.aboutOutdorrModel.findByIdAndUpdate(
        id,
        { $set: UpdateAboutOutdorrDto },
        { new: true },
      );
    }
  }

  // delete about-outdorr - test edildi
  async deleteAboutOutdorr(id: string): Promise<string> {
    const aboutOutdorrExist = await this.aboutOutdorrModel.findById(id);
    if (!aboutOutdorrExist) {
      throw new HttpException(
        'The information you want to delete does not exist',
        HttpStatus.NOT_FOUND,
      );
    } else {
      const deleteAboutOutdorr = await this.aboutOutdorrModel.findByIdAndDelete(
        id,
      );
      await this.whyOutdorrModel.findOneAndUpdate(
        { _id: deleteAboutOutdorr.why_outdorr },
        { $pull: { about_outdorr: deleteAboutOutdorr._id } },
      );
      return 'Information about Outdoor has been deleted';
    }
  }

  // get single about-outdorr - test edildi
  async getSingleAboutOutdorr(id: string): Promise<AboutOutdorr> {
    const aboutOutdorrExist = await this.aboutOutdorrModel.findById(id);
    if (!aboutOutdorrExist) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    } else {
      return aboutOutdorrExist;
    }
  }

  // get all about-outdorr - test edildi
  async getAllAboutOutdorr(): Promise<AboutOutdorr[]> {
    return await this.aboutOutdorrModel.find();
  }

  // create project design - test ok
  async createProjectDesign(
    createProjectDesignDto: CreateProjectDesignDto,
  ): Promise<ProjectDesign> {
    const { title, description } = createProjectDesignDto;
    const projectDesign = await this.projectDesignModel.findOne({
      title,
      description,
    });
    if (projectDesign) {
      throw new HttpException(
        'The data is already available in the database.',
        HttpStatus.CONFLICT,
      );
    } else {
      return await this.projectDesignModel.create(createProjectDesignDto);
    }
  }

  // update project design  - test ok
  async updateProjectDesign(
    id: string,
    updateProjectDesignDto: UpdateProjectDesignDto,
  ): Promise<ProjectDesign> {
    const projectDesignExist = await this.projectDesignModel.findById(id);
    if (!projectDesignExist) {
      throw new HttpException(
        'Information about the design of the project was not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.projectDesignModel.findByIdAndUpdate(
      id,
      { $set: { ...updateProjectDesignDto } },
      { new: true },
    );
  }

  // delete project design - test ok
  async deleteProjectDesign(id: string): Promise<string> {
    const projectDesignExist = await this.projectDesignModel.findById(id);
    if (!projectDesignExist) {
      throw new HttpException(
        'Information about the design of the project was not found',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.projectDesignModel.findByIdAndDelete(id);
    return 'The data has been deleted';
  }

  // get all project design - test ok
  async getAllProjectDesign(): Promise<ProjectDesign[]> {
    return await this.projectDesignModel
      .find()
      .populate({
        path: 'design_details',
        select: ['title', 'description', 'photo', 'step'],
      });
  }

  // get single project design - test ok
  async getSingleProjectDesign(id: string): Promise<ProjectDesign> {
    const projectDesignExist = await this.projectDesignModel.findById(id);
    if (!projectDesignExist) {
      throw new HttpException(
        'Information about the design of the project was not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return (await this.projectDesignModel.findById(id)).populate({
      path: 'design_details',
      select: ['title', 'description', 'photo', 'step'],
    });
  }

  // create project design details - test ok
  async createProjectDesignDetails(
    createProjectDesignDetailsDto: CreateProjectDesignDetailsDto,
    file: Express.Multer.File,
  ): Promise<ProjectDesignDetails> {
    const { step, title, description } = createProjectDesignDetailsDto;
    const projectDesignDetails = await this.projectDesignDetailsModel.findOne({
      step,
      title,
      description,
    });
    if (projectDesignDetails) {
      throw new HttpException(
        'The data is already available in the database.',
        HttpStatus.CONFLICT,
      );
    }
    const data = await cloudinary.uploader.upload(file.path, {
      public_id: file.originalname,
    });
    const newProjectDesignDetails = await this.projectDesignDetailsModel.create(
      { ...createProjectDesignDetailsDto, photo: data.url },
    );
    return await this.projectDesignModel.findOneAndUpdate(
      { _id: newProjectDesignDetails.project_design },
      { $push: { design_details: newProjectDesignDetails._id } },
      { new: true },
    );
  }

  // update project design details - test ok
  async updateProjectDesignDetails(
    id: string,
    updateProjectDesignDetailsDto: UpdateProjectDesignDetailsDto,
    file: Express.Multer.File,
  ): Promise<ProjectDesignDetails> {
    const projectDesignDetailsExist =
      await this.projectDesignDetailsModel.findById(id);
    if (!projectDesignDetailsExist) {
      throw new HttpException(
        'Information about the design details of the project was not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (file && file.path) {
      const data = await cloudinary.uploader.upload(file.path, {
        public_id: file.originalname,
      });
      return await this.projectDesignDetailsModel.findByIdAndUpdate(
        id,
        { $set: { ...updateProjectDesignDetailsDto, photo: data.url } },
        { new: true },
      );
    }
    return await this.projectDesignDetailsModel.findByIdAndUpdate(
      id,
      { $set: { ...updateProjectDesignDetailsDto } },
      { new: true },
    );
  }

  // delete project design details - test ok
  async deleteProjectDesignDetails(id: string): Promise<string> {
    const projectDesignDetailsExist =
      await this.projectDesignDetailsModel.findById(id);
    if (!projectDesignDetailsExist) {
      throw new HttpException(
        'Information about the design details of the project was not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const DeleteProjectDesignDetails =
      await this.projectDesignDetailsModel.findByIdAndDelete(id);
    await this.projectDesignModel.findOneAndUpdate(
      { _id: DeleteProjectDesignDetails.project_design },
      { $pull: { design_details: DeleteProjectDesignDetails._id } },
    );
    return 'The data has been deleted';
  }

  // get All project design detailsv - test ok
  async getAllProjectDesignDetails(): Promise<ProjectDesignDetails[]> {
    return this.projectDesignDetailsModel.find();
  }

  // get single project design detail - test ok
  async getSingleProjectDesignDetails(
    id: string,
  ): Promise<ProjectDesignDetails> {
    return this.projectDesignDetailsModel.findById(id);
  }

  // get all request project
  async getAllRequestProject(): Promise<RequestProject[]> {
    return await this.requestProjectModel.find();
  }

  async getSingleRequestProject(id: string): Promise<RequestProject> {
    return await this.requestProjectModel.findById(id);
  }
}
