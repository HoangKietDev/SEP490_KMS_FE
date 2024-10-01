import React from 'react'
import SectionName from '../../ui/sectionName'
import Title from '../../ui/title'
import { Button } from '../../ui/button'
import { Link } from 'react-router-dom'
import Kindergarden from '@/assets/icons/kindergarden'
import Book from '@/assets/icons/book'
import Blocks from '@/assets/icons/blocks'
import Chalkboard from '@/assets/icons/chalkboard'
import CardOne from './cardOne'
import SectionDescription from '@/components/ui/sectionDescription'

const SuccessProjectOne = () => {
    return (
        <section className="lg:pt-15 pt-10 lg:pb-15 pb-10">
            <div className="container">
                <div className="grid xl:grid-cols-2 lg:grid-cols-[40%_auto] grid-cols-1 gap-7.5">

                    <div className="lg:max-w-[600px]">
                        <SectionName className={"text-primary-foreground"}>Number Talks</SectionName>
                        <Title size={"3.5xl"} className={"lg:max-w-[410px] pb-5"}>Invest in education invest in the future</Title>
                        <SectionDescription> The customer is very happy to be followed. As I have said many times, my bed is easy to read. The destruction of the mass of the ugly is the fear of the life of Loren himself. My favorite bed has been told many times</SectionDescription>
                        <Button asChild variant="outline" className="mt-10">
                            <Link to={"/contact-us"}>Get a quote</Link>
                        </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-7.5">
                        <CardOne icon={<Kindergarden />} color={"bg-primary"} number={"500"} title={"Running Students"} />
                        <CardOne icon={<Book />} color={"bg-destructive"} number={"300"} title={"Completed"} />
                        {/* <CardOne icon={<Blocks />} color={"bg-green"} number={"3K"} title={"Award Winning"} />
                        <CardOne icon={<Chalkboard />} color={"bg-secondary"} number={"23K"} title={"Guardian Satishfaction"} /> */}

                    </div>

                </div>
            </div>
        </section>
    )
}

export default SuccessProjectOne

